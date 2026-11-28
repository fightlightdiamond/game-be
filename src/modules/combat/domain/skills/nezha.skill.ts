import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Nezha hero skill.
 *
 * Ports SkillService.Nezha. When HP is at or below 50 % of max HP and a
 * random roll is ≤ 50, the skill activates (but produces no stat changes —
 * the activation flag was set on the mutable log in the original).
 *
 * NOTE: HeroSnapshot has no max-HP field; the ratio check cannot be performed.
 * The snapshot is returned unchanged, preserving the interface contract.
 * CombatEngine may extend this if future design adds a maxHp field.
 */
export class NezhaSkill implements SkillStrategy {
  private getRand(): number {
    return Math.floor(Math.random() * 100) + 1;
  }

  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot] {
    if (defender.effectResistance || attacker.intrinsicStatus === -1) {
      return [attacker, defender];
    }

    // Original: ratioHp = home.current_hp / home.hp; trigger if <= 0.5 && getRand() <= 50
    // Without maxHp, the ratio cannot be computed. Skill activation has no stat effect;
    // snapshots are returned unmodified.
    return [attacker, defender];
  }
}
