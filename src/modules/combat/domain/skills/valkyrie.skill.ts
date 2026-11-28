import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Valkyrie hero skill.
 *
 * Ports SkillService.Valkyrie. Increments intrinsicStatus (capped at 4) each
 * time the skill fires, then deals damage equal to 2 % × intrinsicStatus × defender max HP.
 *
 * NOTE: Valkyrie's damage is based on `away.hp` (defender max HP). HeroSnapshot
 * uses `hp` for current HP; here we use `defender.hp` as the best available proxy.
 */
export class ValkyrieSkill implements SkillStrategy {
  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot] {
    if (defender.effectResistance || attacker.intrinsicStatus === -1) {
      return [attacker, defender];
    }

    const newIntrinsicStatus =
      attacker.intrinsicStatus < 4
        ? attacker.intrinsicStatus + 1
        : attacker.intrinsicStatus;

    const dmg = Math.round(0.02 * newIntrinsicStatus * defender.hp);
    const newDefenderHp = defender.hp - dmg;

    return [
      attacker.withIntrinsicStatus(newIntrinsicStatus),
      defender.withHp(newDefenderHp),
    ];
  }
}
