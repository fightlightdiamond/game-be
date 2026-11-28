import { EloMatch } from '../entities/elo-match.entity';

export const ELO_MATCH_REPOSITORY = Symbol('IEloMatchRepository');

export interface IEloMatchRepository {
  save(eloMatch: EloMatch): Promise<EloMatch>;
  findByUserId(userId: number): Promise<EloMatch[]>;
}
