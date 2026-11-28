import { Challenge } from '../challenge';

export const CHALLENGE_REPOSITORY = Symbol('ChallengeRepository');

export interface ChallengeRepository {
  save(challenge: Challenge): Promise<Challenge>;
  findByAccountId(accountId: number): Promise<Challenge[]>;
}
