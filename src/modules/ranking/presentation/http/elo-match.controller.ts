import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../../identity/infrastructure/auth/jwt.guard';
import { ChallengeCommand } from '../../application/commands/challenge/challenge.command';
import { GetLeaderboardQuery } from '../../application/queries/get-leaderboard/get-leaderboard.query';
import { GetEloMatchHistoryQuery } from '../../application/queries/get-elo-match-history/get-elo-match-history.query';
import { ChallengeDto } from './dtos/challenge.dto';

@ApiTags('elo-matches')
@Controller('elo-matches')
export class EloMatchController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('challenge')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async challenge(@Body() dto: ChallengeDto, @Request() req) {
    return this.commandBus.execute(
      new ChallengeCommand(req.user.id, dto.competitor_id),
    );
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.queryBus.execute(
      new GetLeaderboardQuery(Number(page), Number(limit)),
    );
  }

  @Get('history')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async getHistory(@Request() req) {
    return this.queryBus.execute(new GetEloMatchHistoryQuery(req.user.id));
  }
}
