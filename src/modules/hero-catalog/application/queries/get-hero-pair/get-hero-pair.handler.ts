import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Hero } from '../../../domain/aggregates/hero.aggregate';
import {
  HERO_REPOSITORY,
  IHeroRepository,
} from '../../../domain/repositories/hero.repository.interface';
import { GetHeroPairQuery } from './get-hero-pair.query';

@QueryHandler(GetHeroPairQuery)
export class GetHeroPairHandler
  implements IQueryHandler<GetHeroPairQuery, [Hero, Hero]>
{
  constructor(
    @Inject(HERO_REPOSITORY)
    private readonly heroRepository: IHeroRepository,
  ) {}

  async execute(): Promise<[Hero, Hero]> {
    return this.heroRepository.getPair();
  }
}
