import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { publishHero, PublishedHero } from '../../published-hero';
import {
  HERO_REPOSITORY,
  IHeroRepository,
} from '../../../domain/repositories/hero.repository.interface';
import { GetPublishedHeroQuery } from './get-published-hero.query';

@QueryHandler(GetPublishedHeroQuery)
export class GetPublishedHeroHandler
  implements IQueryHandler<GetPublishedHeroQuery, PublishedHero | null>
{
  constructor(
    @Inject(HERO_REPOSITORY)
    private readonly heroRepository: IHeroRepository,
  ) {}

  async execute(query: GetPublishedHeroQuery): Promise<PublishedHero | null> {
    const hero = await this.heroRepository.findById(query.heroId);
    return hero ? publishHero(hero) : null;
  }
}
