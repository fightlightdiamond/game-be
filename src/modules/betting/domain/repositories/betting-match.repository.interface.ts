import { BettingMatch } from '../aggregates/betting-match.aggregate';

export const BETTING_MATCH_REPOSITORY = Symbol('IBettingMatchRepository');

export interface IBettingMatchRepository {
  findById(id: number): Promise<BettingMatch | null>;
  save(match: BettingMatch): Promise<BettingMatch>;
  findCurrentMatchId(): Promise<number | null>;
  findStatistics(id?: number): Promise<Array<Record<string, unknown>>>;
}
