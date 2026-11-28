import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Hell hero skill.
 *
 * Ports SkillService.Hell. The original code tracked `home.hp` (max HP) and
 * `home.current_hp` (current HP) separately. HeroSnapshot uses a single `hp`
 * field representing current HP; the base HP is not stored separately.
 * Ratio-based threshold checks therefore use `attacker.hp` for both roles.
 */
export class HellSkill implements SkillStrategy {
  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot] {
    if (defender.effectResistance || attacker.intrinsicStatus === -1) {
      return [attacker, defender];
    }

    let newAttackerAtk = attacker.atk;
    let newDefenderHp = defender.hp;

    if (attacker.hp < defender.hp) {
      newAttackerAtk += Math.round((defender.hp - attacker.hp) / 10);
    }

    if (defender.hp <= 0) {
      newDefenderHp = 0;
    }

    return [attacker.withAtk(newAttackerAtk), defender.withHp(newDefenderHp)];
  }
}
