import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Amon hero skill.
 *
 * Ports SkillService.Amon. Heals the attacker for 30 % of ATK, reduces
 * defender DEF by a formula based on attacker's lost HP, and increments
 * intrinsicStatus.
 *
 * NOTE: The original DEF reduction uses `home.hp - home.current_hp` (lost HP).
 * HeroSnapshot has no max-HP field, so the lost-HP portion of the formula is
 * treated as 0. Only the percentage-of-defender-def component is applied.
 */
export class AmonSkill implements SkillStrategy {
  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot] {
    if (defender.effectResistance || attacker.intrinsicStatus === -1) {
      return [attacker, defender];
    }

    const newAttackerHp = attacker.hp + Math.round(attacker.atk * 0.3);
    const newIntrinsicStatus = attacker.intrinsicStatus + 1;

    // Original: (home.hp - home.current_hp) * 0.006 + (away.def > 0 ? away.def * 0.2 : 0)
    // Lost HP cannot be computed without a maxHp field; that term is 0 here.
    const defReduction = Math.round(
      0 + (defender.def > 0 ? defender.def * 0.2 : 0),
    );
    const newDefenderDef = defender.def - defReduction;

    return [
      attacker.withHp(newAttackerHp).withIntrinsicStatus(newIntrinsicStatus),
      defender.withDef(newDefenderDef),
    ];
  }
}
