import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetCurrentMatchQuery } from '../../application/queries/get-current-match/get-current-match.query';
import { GetMatchHistoryQuery } from '../../application/queries/get-match-history/get-match-history.query';
import { GetMatchStatisticsQuery } from '../../application/queries/get-match-statistics/get-match-statistics.query';

@ApiTags('matches')
@Controller('matches')
export class MatchController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current match' })
  @ApiResponse({
    status: 200,
    description: 'Current match retrieved successfully.',
  })
  async getCurrent() {
    return this.queryBus.execute(new GetCurrentMatchQuery());
  }

  @Get('history')
  @ApiOperation({ summary: 'Get match history' })
  @ApiResponse({
    status: 200,
    description: 'Match history retrieved successfully.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.queryBus.execute(new GetMatchHistoryQuery(+page, +limit));
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get match statistics' })
  @ApiResponse({
    status: 200,
    description: 'Match statistics retrieved successfully.',
  })
  @ApiQuery({ name: 'heroId', required: false, type: Number })
  @ApiQuery({ name: 'orderBy', required: false, type: String })
  async getStatistics(
    @Query('heroId') heroId?: number,
    @Query('orderBy') orderBy?: string,
  ) {
    return this.queryBus.execute(
      new GetMatchStatisticsQuery(heroId ? +heroId : undefined, orderBy),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get match by ID' })
  @ApiResponse({ status: 200, description: 'Match retrieved successfully.' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  async getById() {
    return this.queryBus.execute(new GetCurrentMatchQuery());
  }
}
