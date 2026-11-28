import { HouseMatch } from '../house-match';
import { RewardsPaid } from '../events/rewards-paid.event';
import { Stake } from '../stake';

export const HOUSE_MATCH_REPOSITORY = Symbol('HOUSE_MATCH_REPOSITORY');

export interface HouseMatchRepository {
  findById(id: number): Promise<HouseMatch | null>;
  findCurrent(): Promise<HouseMatch | null>;
  open(match: HouseMatch): Promise<{ match: HouseMatch; created: boolean }>;
  save(match: HouseMatch): Promise<void>;
  placeStake(
    matchId: number,
    accountId: number,
    heroId: number,
    amount: number,
  ): Promise<Stake>;
  settle(matchId: number): Promise<RewardsPaid | null>;
  findStatistics(heroId?: number): Promise<Array<Record<string, unknown>>>;
}
