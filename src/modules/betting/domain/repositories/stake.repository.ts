import { Stake } from '../stake';

export const STAKE_REPOSITORY = Symbol('STAKE_REPOSITORY');

export interface StakeRepository {
  findByAccountAndMatch(
    accountId: number,
    matchId: number,
  ): Promise<Stake | null>;
}
