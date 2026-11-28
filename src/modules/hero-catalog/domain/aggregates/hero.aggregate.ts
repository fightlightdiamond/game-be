import { HeroStats } from '../value-objects/hero-stats.vo';

export class Hero {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly element: string,
    public readonly position: string,
    public readonly story: string,
    public readonly guide: string,
    public readonly skill: string | null,
    public readonly stats: HeroStats,
  ) {}
}
