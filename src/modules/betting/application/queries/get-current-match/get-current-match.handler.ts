import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BettingMatch } from '../../../domain/aggregates/betting-match.aggregate';
import {
  BETTING_MATCH_REPOSITORY,
  IBettingMatchRepository,
} from '../../../domain/repositories/betting-match.repository.interface';
import { GetCurrentMatchQuery } from './get-current-match.query';

@QueryHandler(GetCurrentMatchQuery)
export class GetCurrentMatchHandler
  implements IQueryHandler<GetCurrentMatchQuery, BettingMatch | null>
{
  constructor(
    @Inject(BETTING_MATCH_REPOSITORY)
    private readonly repo: IBettingMatchRepository,
  ) {}

  async execute(): Promise<BettingMatch | null> {
    const matchId = await this.repo.findCurrentMatchId();
    if (matchId === null) {
      return null;
    }
    return this.repo.findById(matchId);
  }
}
