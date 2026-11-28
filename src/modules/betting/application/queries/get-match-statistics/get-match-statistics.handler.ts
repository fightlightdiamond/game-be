import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
import { GetMatchStatisticsQuery } from './get-match-statistics.query';

@QueryHandler(GetMatchStatisticsQuery)
export class GetMatchStatisticsHandler
  implements
    IQueryHandler<GetMatchStatisticsQuery, Array<Record<string, unknown>>>
{
  constructor(
    @Inject(HOUSE_MATCH_REPOSITORY)
    private readonly repo: HouseMatchRepository,
  ) {}

  async execute(
    query: GetMatchStatisticsQuery,
  ): Promise<Array<Record<string, unknown>>> {
    return this.repo.findStatistics(query.heroId);
  }
}
