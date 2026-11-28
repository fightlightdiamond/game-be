import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Sphinx hero skill.
 *
 * Ports SkillService.Sphinx. The original code maintained separate `current_def`
 * and `def` (base) fields; both were reduced by different formulas. HeroSnapshot
 * exposes a single `def` field, so both reductions are applied together.
 *
 * The `turn_number % 2` ATK boost for the attacker when HP is lower is not
 * implemented here because HeroSnapshot carries no turn counter; that check
 * belongs to CombatEngine if needed.
 */
export class SphinxSkill implements SkillStrategy {
  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot] {
    if (defender.effectResistance || attacker.intrinsicStatus === -1) {
      return [attacker, defender];
    }

    // Flat + percentage reduction on current def
    const currentDefReduction = Math.round(
      30 + (defender.def > 0 ? defender.def * 0.1 : 0),
    );

    // ATK-based + percentage reduction on base def
    const baseDefReduction = Math.round(
      attacker.atk * 0.03 + (defender.def > 0 ? defender.def * 0.2 : 0),
    );

    const newDef = defender.def - currentDefReduction - baseDefReduction;

    return [attacker, defender.withDef(newDef)];
  }
}
