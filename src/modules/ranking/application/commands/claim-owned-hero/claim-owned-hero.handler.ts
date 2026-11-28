import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { PublishedHero } from '../../../../hero-catalog/application/published-hero';
import { GetPublishedHeroQuery } from '../../../../hero-catalog/application/queries/get-published-hero/get-published-hero.query';
import { OwnedHero } from '../../../domain/owned-hero';
import {
  OwnedHeroRepository,
  OWNED_HERO_REPOSITORY,
} from '../../../domain/repositories/owned-hero.repository';
import { ClaimOwnedHeroCommand } from './claim-owned-hero.command';

@CommandHandler(ClaimOwnedHeroCommand)
export class ClaimOwnedHeroHandler
  implements ICommandHandler<ClaimOwnedHeroCommand>
{
  constructor(
    @Inject(OWNED_HERO_REPOSITORY)
    private readonly heroes: OwnedHeroRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: ClaimOwnedHeroCommand): Promise<OwnedHero> {
    const existing = await this.heroes.findByAccountId(command.accountId);
    const hero = await this.queryBus.execute<
      GetPublishedHeroQuery,
      PublishedHero | null
    >(new GetPublishedHeroQuery(command.heroId));
    if (!hero) {
      throw new HttpException('Catalog hero not found', HttpStatus.NOT_FOUND);
    }
    const owned = OwnedHero.claim(command.accountId, hero.id, hero, existing);
    return this.heroes.save(owned);
  }
}
