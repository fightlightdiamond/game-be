import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Hero } from '../../../domain/hero';
import {
  HERO_REPOSITORY,
  IHeroRepository,
} from '../../../domain/repositories/hero.repository.interface';
import { ListHeroesQuery } from './list-heroes.query';

@QueryHandler(ListHeroesQuery)
export class ListHeroesHandler
  implements IQueryHandler<ListHeroesQuery, Hero[]>
{
  constructor(
    @Inject(HERO_REPOSITORY)
    private readonly heroRepository: IHeroRepository,
  ) {}

  async execute(): Promise<Hero[]> {
    return this.heroRepository.listAll();
  }
}
