import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  STAKE_REPOSITORY,
  StakeRepository,
} from '../../../domain/repositories/stake.repository';
import { Stake } from '../../../domain/stake';
import { GetBetByUserAndMatchQuery } from './get-bet-by-user-and-match.query';

@QueryHandler(GetBetByUserAndMatchQuery)
export class GetBetByUserAndMatchHandler
  implements IQueryHandler<GetBetByUserAndMatchQuery, Stake | null>
{
  constructor(
    @Inject(STAKE_REPOSITORY)
    private readonly stakes: StakeRepository,
  ) {}

  async execute(query: GetBetByUserAndMatchQuery): Promise<Stake | null> {
    return this.stakes.findByAccountAndMatch(query.userId, query.matchId);
  }
}
