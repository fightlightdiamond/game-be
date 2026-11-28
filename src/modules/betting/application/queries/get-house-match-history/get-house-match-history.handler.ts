import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
import { GetHouseMatchHistoryQuery } from './get-house-match-history.query';

@QueryHandler(GetHouseMatchHistoryQuery)
export class GetHouseMatchHistoryHandler
  implements
    IQueryHandler<GetHouseMatchHistoryQuery, Array<Record<string, unknown>>>
{
  constructor(
    @Inject(HOUSE_MATCH_REPOSITORY)
    private readonly repo: HouseMatchRepository,
  ) {}

  async execute(): Promise<Array<Record<string, unknown>>> {
    return this.repo.findStatistics();
  }
}
