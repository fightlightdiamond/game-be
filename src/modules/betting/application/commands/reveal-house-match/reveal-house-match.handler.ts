import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Phase } from '../../../domain/phase';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
import { RevealHouseMatchCommand } from './reveal-house-match.command';

@CommandHandler(RevealHouseMatchCommand)
export class RevealHouseMatchHandler
  implements ICommandHandler<RevealHouseMatchCommand>
{
  constructor(
    @Inject(HOUSE_MATCH_REPOSITORY)
    private readonly houseMatches: HouseMatchRepository,
    @Inject(EventBus)
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RevealHouseMatchCommand): Promise<void> {
    const match = await this.houseMatches.findById(command.matchId);
    if (!match || match.currentPhase !== Phase.Open) {
      return;
    }
    const revealed = match.reveal();
    await this.houseMatches.save(match);
    this.eventBus.publish(revealed);
  }
}
