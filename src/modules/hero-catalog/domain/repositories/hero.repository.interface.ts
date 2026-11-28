import { Hero } from '../aggregates/hero.aggregate';

export const HERO_REPOSITORY = Symbol('IHeroRepository');

export interface IHeroRepository {
  findById(id: number): Promise<Hero | null>;
  findByName(name: string): Promise<Hero | null>;
  getPair(): Promise<[Hero, Hero]>;
  listAll(): Promise<Hero[]>;
}
