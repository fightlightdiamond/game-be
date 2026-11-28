import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IUserHeroRepository,
  USER_HERO_REPOSITORY,
} from '../../../domain/repositories/user-hero.repository.interface';
import { GetLeaderboardQuery } from './get-leaderboard.query';

@QueryHandler(GetLeaderboardQuery)
export class GetLeaderboardHandler
  implements IQueryHandler<GetLeaderboardQuery>
{
  constructor(
    @Inject(USER_HERO_REPOSITORY)
    private readonly userHeroRepo: IUserHeroRepository,
  ) {}

  async execute(query: GetLeaderboardQuery) {
    return this.userHeroRepo.findLeaderboard({
      page: query.page,
      limit: query.limit,
    });
  }
}
