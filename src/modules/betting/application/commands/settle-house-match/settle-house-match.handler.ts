import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
import { OpenHouseMatchCommand } from '../open-house-match/open-house-match.command';
import { SettleHouseMatchCommand } from './settle-house-match.command';

@CommandHandler(SettleHouseMatchCommand)
export class SettleHouseMatchHandler
  implements ICommandHandler<SettleHouseMatchCommand>
{
  constructor(
    @Inject(HOUSE_MATCH_REPOSITORY)
    private readonly houseMatches: HouseMatchRepository,
    private readonly commandBus: CommandBus,
    @Inject(EventBus)
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SettleHouseMatchCommand): Promise<void> {
    const paid = await this.houseMatches.settle(command.matchId);
    if (!paid) {
      return;
    }
    this.eventBus.publish(paid);
    await this.commandBus.execute(new OpenHouseMatchCommand());
  }
}
