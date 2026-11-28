import { HeroStats } from './value-objects/hero-stats.vo';

/** A catalog row. No rules. Callers freeze a Fighter from it. */
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
