import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  OwnedHeroRepository,
  OWNED_HERO_REPOSITORY,
} from '../../../domain/repositories/owned-hero.repository';
import { GetLeaderboardQuery } from './get-leaderboard.query';

@QueryHandler(GetLeaderboardQuery)
export class GetLeaderboardHandler
  implements IQueryHandler<GetLeaderboardQuery>
{
  constructor(
    @Inject(OWNED_HERO_REPOSITORY)
    private readonly ownedHeroes: OwnedHeroRepository,
  ) {}

  async execute(query: GetLeaderboardQuery) {
    return this.ownedHeroes.findLeaderboard({
      page: query.page,
      limit: query.limit,
    });
  }
}
