import { Challenge } from '../challenge';

export const ELO_MATCH_REPOSITORY = Symbol('IEloMatchRepository');

export interface IEloMatchRepository {
  save(challenge: Challenge): Promise<Challenge>;
  findByUserId(userId: number): Promise<Challenge[]>;
}
