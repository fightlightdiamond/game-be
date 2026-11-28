import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import {
  USER_HERO_REPOSITORY,
  IUserHeroRepository,
} from '../../../domain/repositories/user-hero.repository.interface';
import { DeductBalanceCommand } from '../../../../identity/application/commands/deduct-balance/deduct-balance.command';
import { UserHero } from '../../../domain/aggregates/user-hero.aggregate';
import { LevelUpUserHeroCommand } from './level-up-user-hero.command';

@CommandHandler(LevelUpUserHeroCommand)
export class LevelUpUserHeroHandler
  implements ICommandHandler<LevelUpUserHeroCommand>
{
  constructor(
    @Inject(USER_HERO_REPOSITORY)
    private readonly userHeroRepo: IUserHeroRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: LevelUpUserHeroCommand): Promise<UserHero> {
    // 1. Load UserHero by id
    const userHero = await this.userHeroRepo.findById(command.userHeroId);
    if (!userHero) {
      throw new HttpException('UserHero not found', HttpStatus.NOT_FOUND);
    }

    // 2. Calculate cost: 2^(level + 1)
    const cost = Math.pow(2, userHero.level + 1);

    // 3. Deduct balance — if it throws, do NOT increment level
    await this.commandBus.execute(
      new DeductBalanceCommand(command.userId, cost),
    );

    // 4. Level up
    userHero.levelUp();

    // 5. Save and return
    return this.userHeroRepo.save(userHero);
  }
}
