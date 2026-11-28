import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  STAKE_REPOSITORY,
  StakeRepository,
} from '../../../domain/repositories/stake.repository';
import { Stake } from '../../../domain/stake';
import { GetStakeQuery } from './get-stake.query';

@QueryHandler(GetStakeQuery)
export class GetStakeHandler
  implements IQueryHandler<GetStakeQuery, Stake | null>
{
  constructor(
    @Inject(STAKE_REPOSITORY)
    private readonly stakes: StakeRepository,
  ) {}

  async execute(query: GetStakeQuery): Promise<Stake | null> {
    return this.stakes.findByAccountAndMatch(query.accountId, query.matchId);
  }
}
