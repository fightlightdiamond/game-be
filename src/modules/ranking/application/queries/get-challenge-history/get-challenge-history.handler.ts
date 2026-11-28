import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CHALLENGE_REPOSITORY,
  ChallengeRepository,
} from '../../../domain/repositories/challenge.repository';
import { GetChallengeHistoryQuery } from './get-challenge-history.query';

@QueryHandler(GetChallengeHistoryQuery)
export class GetChallengeHistoryHandler
  implements IQueryHandler<GetChallengeHistoryQuery>
{
  constructor(
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challenges: ChallengeRepository,
  ) {}

  async execute(query: GetChallengeHistoryQuery) {
    return this.challenges.findByAccountId(query.accountId);
  }
}
