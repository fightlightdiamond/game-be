import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HeroExistsPipe } from '../../common/pipes/hero-exists.pipe';
import { MatchService } from './match.service';

type TOrderStatistic = 'lose' | 'num' | 'percent' | 'win';

@ApiTags('statistic-match')
@Controller('statistic-matches')
export class StatisticMatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('')
  @ApiOperation({ summary: 'Match statistic' })
  @ApiQuery({
    name: 'order_by',
    example: 'percent',
    description: 'The order by of statistic match',
  })
  @ApiResponse({ status: 200, description: 'Match statistic successfully.' })
  async statistic(@Query('order_by') orderBy: TOrderStatistic) {
    return this.matchService.statistic(orderBy);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Match statistic' })
  @ApiParam({
    name: 'id',
    description: 'The id of hero',
  })
  @ApiQuery({
    name: 'order_by',
    example: 'percent',
    description: 'The order by of statistic match',
  })
  @ApiResponse({ status: 200, description: 'Match statistic successfully.' })
  async statisticOne(
    @Param('id', HeroExistsPipe) id,
    @Query('order_by') orderBy: TOrderStatistic,
  ) {
    return this.matchService.statisticOne(id, orderBy);
  }
}
