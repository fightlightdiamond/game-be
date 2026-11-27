import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  BETTING_MATCH_REPOSITORY,
  IBettingMatchRepository,
} from '../../../domain/repositories/betting-match.repository.interface';
import { GetMatchStatisticsQuery } from './get-match-statistics.query';

@QueryHandler(GetMatchStatisticsQuery)
export class GetMatchStatisticsHandler
  implements
    IQueryHandler<GetMatchStatisticsQuery, Array<Record<string, unknown>>>
{
  constructor(
    @Inject(BETTING_MATCH_REPOSITORY)
    private readonly repo: IBettingMatchRepository,
  ) {}

  async execute(
    query: GetMatchStatisticsQuery,
  ): Promise<Array<Record<string, unknown>>> {
    return this.repo.findStatistics(query.heroId);
  }
}
