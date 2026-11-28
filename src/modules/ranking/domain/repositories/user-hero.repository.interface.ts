import { UserHero } from '../aggregates/user-hero.aggregate';

export const USER_HERO_REPOSITORY = Symbol('IUserHeroRepository');

export interface IUserHeroRepository {
  findById(id: number): Promise<UserHero | null>;
  findByUserId(userId: number): Promise<UserHero | null>;
  save(userHero: UserHero): Promise<UserHero>;
  findLeaderboard(options: {
    page: number;
    limit: number;
  }): Promise<UserHero[]>;
}
