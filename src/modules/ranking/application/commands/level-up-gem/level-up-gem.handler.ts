import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  GEM_REPOSITORY,
  GemRepository,
} from '../../../domain/repositories/gem.repository';
import { ROLL, Roll } from '../../../domain/roll';
import { LevelUpGemCommand } from './level-up-gem.command';

@CommandHandler(LevelUpGemCommand)
export class LevelUpGemHandler implements ICommandHandler<LevelUpGemCommand> {
  constructor(
    @Inject(GEM_REPOSITORY)
    private readonly gems: GemRepository,
    @Inject(ROLL)
    private readonly roll: Roll,
  ) {}

  async execute(command: LevelUpGemCommand): Promise<{ gained: boolean }> {
    return this.gems.levelUp(
      command.accountId,
      command.type,
      command.level,
      command.spent,
      this.roll.between(1, 100),
    );
  }
}
