import { OwnedHero } from '../owned-hero';

export const USER_HERO_REPOSITORY = Symbol('IUserHeroRepository');

export interface IUserHeroRepository {
  findById(id: number): Promise<OwnedHero | null>;
  findByUserId(userId: number): Promise<OwnedHero | null>;
  save(hero: OwnedHero): Promise<OwnedHero>;
  findLeaderboard(options: {
    page: number;
    limit: number;
  }): Promise<OwnedHero[]>;
}
