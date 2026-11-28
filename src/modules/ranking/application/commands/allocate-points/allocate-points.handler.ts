import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import {
  USER_HERO_REPOSITORY,
  IUserHeroRepository,
} from '../../../domain/repositories/user-hero.repository.interface';
import { OwnedHero } from '../../../domain/owned-hero';
import { AllocatePointsCommand } from './allocate-points.command';

@CommandHandler(AllocatePointsCommand)
export class AllocatePointsHandler
  implements ICommandHandler<AllocatePointsCommand>
{
  constructor(
    @Inject(USER_HERO_REPOSITORY)
    private readonly userHeroRepo: IUserHeroRepository,
  ) {}

  async execute(command: AllocatePointsCommand): Promise<OwnedHero> {
    // 1. Load UserHero by id and verify userId matches
    const userHero = await this.userHeroRepo.findById(command.userHeroId);
    if (!userHero) {
      throw new HttpException('UserHero not found', HttpStatus.NOT_FOUND);
    }
    if (userHero.userId !== command.userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    // 2. Allocate points — may throw ExceedsLevelCapException
    userHero.allocatePoints(
      command.atkPoint,
      command.defPoint,
      command.hpPoint,
      command.spdPoint,
      command.critRatePoint,
    );

    // 3. Save and return
    return this.userHeroRepo.save(userHero);
  }
}
