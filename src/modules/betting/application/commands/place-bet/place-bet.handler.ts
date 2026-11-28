import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject, HttpException, HttpStatus } from '@nestjs/common';
import {
  BETTING_MATCH_REPOSITORY,
  IBettingMatchRepository,
} from '../../../domain/repositories/betting-match.repository.interface';
import {
  BET_REPOSITORY,
  IBetRepository,
} from '../../../domain/repositories/bet.repository.interface';
import { LEDGER, Ledger } from '../../../../ledger/domain/ledger';
import { Bet } from '../../../domain/entities/bet.entity';
import { PlaceBetCommand } from './place-bet.command';

@CommandHandler(PlaceBetCommand)
export class PlaceBetHandler implements ICommandHandler<PlaceBetCommand> {
  constructor(
    @Inject(LEDGER)
    private readonly ledger: Ledger,
    @Inject(BETTING_MATCH_REPOSITORY)
    private readonly bettingMatchRepository: IBettingMatchRepository,
    @Inject(BET_REPOSITORY)
    private readonly betRepository: IBetRepository,
    @Inject(EventBus)
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: PlaceBetCommand): Promise<Bet> {
    const match = await this.bettingMatchRepository.findById(command.matchId);
    if (!match) {
      throw new HttpException(
        `Match ${command.matchId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.ledger.debit(command.userId, command.amount);

    // Place bet on aggregate (may throw BettingClosedException)
    const bet = match.placeBet(command.userId, command.heroId, command.amount);

    // Persist the bet
    const savedBet = await this.betRepository.save(bet);

    // Publish domain events (BetPlacedEvent)
    match.publish(this.eventBus);

    return savedBet;
  }
}
