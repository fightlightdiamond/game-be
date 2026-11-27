import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Bet } from '../../../domain/entities/bet.entity';
import {
  BET_REPOSITORY,
  IBetRepository,
} from '../../../domain/repositories/bet.repository.interface';
import { GetBetByUserAndMatchQuery } from './get-bet-by-user-and-match.query';

@QueryHandler(GetBetByUserAndMatchQuery)
export class GetBetByUserAndMatchHandler
  implements IQueryHandler<GetBetByUserAndMatchQuery, Bet | null>
{
  constructor(
    @Inject(BET_REPOSITORY)
    private readonly betRepo: IBetRepository,
  ) {}

  async execute(query: GetBetByUserAndMatchQuery): Promise<Bet | null> {
    return this.betRepo.findByMatchAndUser(query.matchId, query.userId);
  }
}
