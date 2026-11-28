import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ELO_MATCH_REPOSITORY,
  IEloMatchRepository,
} from '../../../domain/repositories/elo-match.repository.interface';
import { GetEloMatchHistoryQuery } from './get-elo-match-history.query';

@QueryHandler(GetEloMatchHistoryQuery)
export class GetEloMatchHistoryHandler
  implements IQueryHandler<GetEloMatchHistoryQuery>
{
  constructor(
    @Inject(ELO_MATCH_REPOSITORY)
    private readonly eloMatchRepo: IEloMatchRepository,
  ) {}

  async execute(query: GetEloMatchHistoryQuery) {
    return this.eloMatchRepo.findByUserId(query.userId);
  }
}
