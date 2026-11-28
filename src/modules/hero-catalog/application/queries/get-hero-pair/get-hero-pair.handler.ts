import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { publishHero, PublishedHero } from '../../published-hero';
import {
  HERO_REPOSITORY,
  IHeroRepository,
} from '../../../domain/repositories/hero.repository.interface';
import { GetHeroPairQuery } from './get-hero-pair.query';

@QueryHandler(GetHeroPairQuery)
export class GetHeroPairHandler
  implements IQueryHandler<GetHeroPairQuery, [PublishedHero, PublishedHero]>
{
  constructor(
    @Inject(HERO_REPOSITORY)
    private readonly heroRepository: IHeroRepository,
  ) {}

  async execute(): Promise<[PublishedHero, PublishedHero]> {
    const [left, right] = await this.heroRepository.getPair();
    return [publishHero(left), publishHero(right)];
  }
}
