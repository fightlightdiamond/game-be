import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { GetHeroQuery } from '../../../../hero-catalog/application/queries/get-hero/get-hero.query';
import { Hero } from '../../../../hero-catalog/domain/hero';
import { OwnedHero } from '../../../domain/owned-hero';
import {
  IUserHeroRepository,
  USER_HERO_REPOSITORY,
} from '../../../domain/repositories/user-hero.repository.interface';
import { ClaimOwnedHeroCommand } from './claim-owned-hero.command';

@CommandHandler(ClaimOwnedHeroCommand)
export class ClaimOwnedHeroHandler
  implements ICommandHandler<ClaimOwnedHeroCommand>
{
  constructor(
    @Inject(USER_HERO_REPOSITORY)
    private readonly heroes: IUserHeroRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: ClaimOwnedHeroCommand): Promise<OwnedHero> {
    const existing = await this.heroes.findByUserId(command.accountId);
    const hero = await this.queryBus.execute<GetHeroQuery, Hero | null>(
      new GetHeroQuery(command.heroId),
    );
    if (!hero) {
      throw new HttpException('Catalog hero not found', HttpStatus.NOT_FOUND);
    }
    const owned = OwnedHero.claim(command.accountId, hero, existing);
    return this.heroes.save(owned);
  }
}
