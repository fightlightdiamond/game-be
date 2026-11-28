import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Fenrir hero skill.
 *
 * Ports SkillService.Fenrir. Each activation grants +5 critRate, +20 critDmg,
 * and increments intrinsicStatus.
 */
export class FenrirSkill implements SkillStrategy {
  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot] {
    if (defender.effectResistance || attacker.intrinsicStatus === -1) {
      return [attacker, defender];
    }

    return [
      attacker
        .withCritRate(attacker.critRate + 5)
        .withCritDmg(attacker.critDmg + 20)
        .withIntrinsicStatus(attacker.intrinsicStatus + 1),
      defender,
    ];
  }
}
