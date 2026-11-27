import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  BETTING_MATCH_REPOSITORY,
  IBettingMatchRepository,
} from '../../../domain/repositories/betting-match.repository.interface';
import { GetMatchHistoryQuery } from './get-match-history.query';

@QueryHandler(GetMatchHistoryQuery)
export class GetMatchHistoryHandler
  implements
    IQueryHandler<GetMatchHistoryQuery, Array<Record<string, unknown>>>
{
  constructor(
    @Inject(BETTING_MATCH_REPOSITORY)
    private readonly repo: IBettingMatchRepository,
  ) {}

  async execute(): Promise<Array<Record<string, unknown>>> {
    return this.repo.findStatistics();
  }
}
