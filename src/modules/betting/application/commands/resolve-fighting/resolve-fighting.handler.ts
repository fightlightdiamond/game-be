import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  BETTING_MATCH_REPOSITORY,
  IBettingMatchRepository,
} from '../../../domain/repositories/betting-match.repository.interface';
import { ResolveFightingCommand } from './resolve-fighting.command';

@CommandHandler(ResolveFightingCommand)
export class ResolveFightingHandler
  implements ICommandHandler<ResolveFightingCommand>
{
  constructor(
    @Inject(BETTING_MATCH_REPOSITORY)
    private readonly bettingMatchRepository: IBettingMatchRepository,
    @Inject(EventBus)
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ResolveFightingCommand): Promise<void> {
    const match = await this.bettingMatchRepository.findById(command.matchId);
    if (!match) {
      throw new Error(`Match ${command.matchId} not found`);
    }

    match.startFighting();
    await this.bettingMatchRepository.save(match);
    match.publish(this.eventBus);
  }
}
