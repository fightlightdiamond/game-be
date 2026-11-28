import { OwnedHero } from '../owned-hero';

export const OWNED_HERO_REPOSITORY = Symbol('OwnedHeroRepository');

export interface OwnedHeroRepository {
  findById(id: number): Promise<OwnedHero | null>;
  findByAccountId(accountId: number): Promise<OwnedHero | null>;
  save(hero: OwnedHero): Promise<OwnedHero>;
  findLeaderboard(options: {
    page: number;
    limit: number;
  }): Promise<OwnedHero[]>;
}
