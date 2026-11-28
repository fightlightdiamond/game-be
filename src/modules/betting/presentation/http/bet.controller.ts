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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PlaceBetCommand } from '../../application/commands/place-bet/place-bet.command';
import { GetBetByUserAndMatchQuery } from '../../application/queries/get-bet-by-user-and-match/get-bet-by-user-and-match.query';
import { JwtGuard } from '../../../identity/infrastructure/auth/jwt.guard';
import { PlaceBetDto } from './dto/place-bet.dto';

@ApiTags('bets')
@Controller('bets')
export class BetController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Place a bet' })
  @ApiResponse({ status: 201, description: 'Bet placed successfully.' })
  @UsePipes(new ValidationPipe())
  async placeBet(@Request() req, @Body() body: PlaceBetDto) {
    const userId: number = req.user.id;
    return this.commandBus.execute(
      new PlaceBetCommand(userId, body.match_id, body.hero_id, body.balance),
    );
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get bet by user and match' })
  @ApiResponse({ status: 200, description: 'Bet retrieved successfully.' })
  async getBetByMatch(@Request() req, @Query('matchId') matchId: number) {
    const userId: number = req.user.id;
    return this.queryBus.execute(
      new GetBetByUserAndMatchQuery(userId, +matchId),
    );
  }
}
