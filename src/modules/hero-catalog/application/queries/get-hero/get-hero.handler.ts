import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Hero } from '../../../domain/hero';
import {
  HERO_REPOSITORY,
  IHeroRepository,
} from '../../../domain/repositories/hero.repository.interface';
import { GetHeroQuery } from './get-hero.query';

@QueryHandler(GetHeroQuery)
export class GetHeroHandler
  implements IQueryHandler<GetHeroQuery, Hero | null>
{
  constructor(
    @Inject(HERO_REPOSITORY)
    private readonly heroRepository: IHeroRepository,
  ) {}

  async execute(query: GetHeroQuery): Promise<Hero | null> {
    return this.heroRepository.findById(query.heroId);
  }
}
