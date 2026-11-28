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
import { PlaceStakeCommand } from '../../application/commands/place-stake/place-stake.command';
import { GetStakeQuery } from '../../application/queries/get-stake/get-stake.query';
import { JwtGuard } from '../../../identity/infrastructure/auth/jwt.guard';
import { PlaceStakeDto } from './dto/place-stake.dto';

@ApiTags('bets')
@Controller('bets')
export class StakeController {
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
  async placeStake(@Request() req, @Body() body: PlaceStakeDto) {
    const accountId: number = req.user.id;
    return this.commandBus.execute(
      new PlaceStakeCommand(
        accountId,
        body.match_id,
        body.hero_id,
        body.amount,
      ),
    );
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get bet by user and match' })
  @ApiResponse({ status: 200, description: 'Bet retrieved successfully.' })
  async getStake(@Request() req, @Query('matchId') matchId: number) {
    const accountId: number = req.user.id;
    return this.queryBus.execute(new GetStakeQuery(accountId, +matchId));
  }
}
