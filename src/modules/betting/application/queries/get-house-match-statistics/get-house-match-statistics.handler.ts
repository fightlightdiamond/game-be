import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
import { GetHouseMatchStatisticsQuery } from './get-house-match-statistics.query';

@QueryHandler(GetHouseMatchStatisticsQuery)
export class GetHouseMatchStatisticsHandler
  implements
    IQueryHandler<GetHouseMatchStatisticsQuery, Array<Record<string, unknown>>>
{
  constructor(
    @Inject(HOUSE_MATCH_REPOSITORY)
    private readonly repo: HouseMatchRepository,
  ) {}

  async execute(
    query: GetHouseMatchStatisticsQuery,
  ): Promise<Array<Record<string, unknown>>> {
    return this.repo.findStatistics(query.heroId);
  }
}
