import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';

export interface SkillStrategy {
  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot];
}
