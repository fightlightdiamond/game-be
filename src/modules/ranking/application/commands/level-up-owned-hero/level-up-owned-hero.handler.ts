import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import {
  OWNED_HERO_REPOSITORY,
  OwnedHeroRepository,
} from '../../../domain/repositories/owned-hero.repository';
import { LEDGER, Ledger } from '../../../../ledger/domain/ledger';
import { OwnedHero } from '../../../domain/owned-hero';
import { LevelUpOwnedHeroCommand } from './level-up-owned-hero.command';

@CommandHandler(LevelUpOwnedHeroCommand)
export class LevelUpOwnedHeroHandler
  implements ICommandHandler<LevelUpOwnedHeroCommand>
{
  constructor(
    @Inject(OWNED_HERO_REPOSITORY)
    private readonly ownedHeroes: OwnedHeroRepository,
    @Inject(LEDGER)
    private readonly ledger: Ledger,
  ) {}

  async execute(command: LevelUpOwnedHeroCommand): Promise<OwnedHero> {
    const hero = await this.ownedHeroes.findById(command.ownedHeroId);
    if (!hero) {
      throw new HttpException('Owned hero not found', HttpStatus.NOT_FOUND);
    }

    const cost = Math.pow(2, hero.level + 1);

    await this.ledger.debit(command.accountId, cost);
    hero.levelUp();
    return this.ownedHeroes.save(hero);
  }
}
