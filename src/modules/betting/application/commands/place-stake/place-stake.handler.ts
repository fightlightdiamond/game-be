import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { StakePlaced } from '../../../domain/events/stake-placed.event';
import { HouseMatchNotFoundException } from '../../../domain/exceptions/stake-refused.exception';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
import { Stake } from '../../../domain/stake';
import { PlaceStakeCommand } from './place-stake.command';

@CommandHandler(PlaceStakeCommand)
export class PlaceStakeHandler implements ICommandHandler<PlaceStakeCommand> {
  constructor(
    @Inject(HOUSE_MATCH_REPOSITORY)
    private readonly houseMatches: HouseMatchRepository,
    @Inject(EventBus)
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: PlaceStakeCommand): Promise<Stake> {
    try {
      const stake = await this.houseMatches.placeStake(
        command.matchId,
        command.accountId,
        command.heroId,
        command.amount,
      );
      this.eventBus.publish(
        new StakePlaced(
          stake.matchId,
          stake.accountId,
          stake.heroId,
          stake.amount,
        ),
      );
      return stake;
    } catch (error) {
      if (error instanceof HouseMatchNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
