import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  BETTING_MATCH_REPOSITORY,
  IBettingMatchRepository,
} from '../../../domain/repositories/betting-match.repository.interface';
import {
  BET_REPOSITORY,
  IBetRepository,
} from '../../../domain/repositories/bet.repository.interface';
import { RewardPolicy } from '../../../domain/services/reward-policy.service';
import { LEDGER, Ledger } from '../../../../ledger/domain/ledger';
import { ResolveRewardCommand } from './resolve-reward.command';

@CommandHandler(ResolveRewardCommand)
export class ResolveRewardHandler
  implements ICommandHandler<ResolveRewardCommand>
{
  constructor(
    @Inject(BETTING_MATCH_REPOSITORY)
    private readonly bettingMatchRepository: IBettingMatchRepository,
    @Inject(BET_REPOSITORY)
    private readonly betRepository: IBetRepository,
    @Inject(LEDGER)
    private readonly ledger: Ledger,
    @Inject(EventBus)
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ResolveRewardCommand): Promise<void> {
    // 1. Load the match (status is FIGHTING at this point)
    const match = await this.bettingMatchRepository.findById(command.matchId);
    if (!match) {
      throw new Error(`Match ${command.matchId} not found`);
    }

    // 2. Load winning bets — match.winner is available because status is FIGHTING
    const winningBets = await this.betRepository.findByMatchAndHero(
      command.matchId,
      match.winner,
    );

    // 3. Calculate payouts
    const policy = new RewardPolicy();
    const payouts = policy.calculatePayouts(winningBets, match.winner);

    // 4. End the match
    const winnerBetEntries = Array.from(payouts.entries()).map(
      ([userId, payout]) => ({ userId, payout }),
    );
    match.endMatch(winnerBetEntries);

    // 5. Persist
    await this.bettingMatchRepository.save(match);

    // 6. Credit each winner's balance
    for (const [userId, payout] of payouts.entries()) {
      await this.ledger.credit(userId, payout);

      // TODO: dispatch AddGemCommand when Ranking BC is implemented
      // if (policy.shouldDropGem()) {
      //   await this.commandBus.execute(new AddGemCommand(userId));
      // }
    }

    // 7. Publish domain events
    match.publish(this.eventBus);
  }
}
