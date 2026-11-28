import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import {
  OWNED_HERO_REPOSITORY,
  OwnedHeroRepository,
} from '../../../domain/repositories/owned-hero.repository';
import { OwnedHero } from '../../../domain/owned-hero';
import { AllocatePointsCommand } from './allocate-points.command';

@CommandHandler(AllocatePointsCommand)
export class AllocatePointsHandler
  implements ICommandHandler<AllocatePointsCommand>
{
  constructor(
    @Inject(OWNED_HERO_REPOSITORY)
    private readonly ownedHeroes: OwnedHeroRepository,
  ) {}

  async execute(command: AllocatePointsCommand): Promise<OwnedHero> {
    const hero = await this.ownedHeroes.findById(command.ownedHeroId);
    if (!hero) {
      throw new HttpException('Owned hero not found', HttpStatus.NOT_FOUND);
    }
    if (hero.accountId !== command.accountId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    // 2. Allocate points — may throw ExceedsLevelCapException
    hero.allocatePoints(
      command.atkPoint,
      command.defPoint,
      command.hpPoint,
      command.spdPoint,
      command.critRatePoint,
    );

    return this.ownedHeroes.save(hero);
  }
}
