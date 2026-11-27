import { Bet } from '../entities/bet.entity';

export const BET_REPOSITORY = Symbol('IBetRepository');

export interface IBetRepository {
  findByMatchAndHero(matchId: number, heroId: number): Promise<Bet[]>;
  findByMatchAndUser(matchId: number, userId: number): Promise<Bet | null>;
  save(bet: Bet): Promise<Bet>;
}
