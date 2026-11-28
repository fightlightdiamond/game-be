import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RewardsPaid } from '../../../betting/domain/events/rewards-paid.event';
import {
  GEM_REPOSITORY,
  GemRepository,
} from '../../domain/repositories/gem.repository';
import { ROLL, Roll } from '../../domain/roll';
import { dropFor } from '../drop-for';

@EventsHandler(RewardsPaid)
export class DropGemHandler implements IEventHandler<RewardsPaid> {
  constructor(
    @Inject(GEM_REPOSITORY)
    private readonly gems: GemRepository,
    @Inject(ROLL)
    private readonly roll: Roll,
  ) {}

  async handle(event: RewardsPaid): Promise<void> {
    return dropFor(
      event.payouts.map((payout) => payout.accountId),
      this.roll,
      this.gems,
    );
  }
}
