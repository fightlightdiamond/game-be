import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
import { GetMatchHistoryQuery } from './get-match-history.query';

@QueryHandler(GetMatchHistoryQuery)
export class GetMatchHistoryHandler
  implements
    IQueryHandler<GetMatchHistoryQuery, Array<Record<string, unknown>>>
{
  constructor(
    @Inject(HOUSE_MATCH_REPOSITORY)
    private readonly repo: HouseMatchRepository,
  ) {}

  async execute(): Promise<Array<Record<string, unknown>>> {
    return this.repo.findStatistics();
  }
}
