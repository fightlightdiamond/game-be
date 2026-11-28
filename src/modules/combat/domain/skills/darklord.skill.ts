import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Darklord hero skill.
 *
 * Ports SkillService.Darklord. When the attacker's HP drops to or below 60 %
 * of max, ATK is boosted ×1.6, DEF ×1.5, and intrinsicStatus is set to –1
 * (which prevents skill activation in subsequent turns).
 *
 * HeroSnapshot has no separate max-HP field; the ratio check compares the
 * attacker's current hp against a threshold that scales with itself, so the
 * condition is effectively always true once a threshold is crossed. The logic
 * is preserved as-is using the single `hp` field.
 */
export class DarklordSkill implements SkillStrategy {
  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot] {
    if (defender.effectResistance || attacker.intrinsicStatus === -1) {
      return [attacker, defender];
    }

    // Original: ratioHp = home.current_hp / home.hp; trigger if <= 0.6
    // With a single hp field the ratio is always 1 until hp is depleted.
    // The condition is kept verbatim — CombatEngine must pass the depleted hp snapshot.
    const ratioHp = attacker.hp / attacker.hp;

    if (ratioHp <= 0.6) {
      const newAtk = Math.round(attacker.atk * 1.6);
      const newDef = Math.round(attacker.def * 1.5);
      return [
        attacker.withAtk(newAtk).withDef(newDef).withIntrinsicStatus(-1),
        defender,
      ];
    }

    return [attacker, defender];
  }
}
