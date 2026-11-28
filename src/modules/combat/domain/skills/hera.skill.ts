import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Hera hero skill.
 *
 * Ports SkillService.Hera. If the defender has an intrinsicStatus and the
 * attacker has not yet activated (intrinsicStatus === 0), the defender's ATK
 * is reduced by 20 % and the attacker's intrinsicStatus is set to 1.
 *
 * Additionally, if the defender's intrinsicStatus is –1 OR a random roll > 30,
 * the attacker's critDmg is boosted by 10 %; otherwise critRate gains 5 and
 * the attacker gains effectResistance.
 */
export class HeraSkill implements SkillStrategy {
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

    let newAttacker = attacker;
    let newDefender = defender;

    if (defender.intrinsicStatus !== 0 && attacker.intrinsicStatus === 0) {
      newAttacker = newAttacker.withIntrinsicStatus(1);
      newDefender = newDefender.withAtk(Math.round(newDefender.atk * 0.8));
    }

    if (defender.intrinsicStatus === -1 || this.getRand() > 30) {
      newAttacker = newAttacker.withCritDmg(
        Math.round(newAttacker.critDmg * 1.1),
      );
    } else {
      newAttacker = newAttacker
        .withCritRate(newAttacker.critRate + 5)
        .withEffectResistance(1);
    }

    return [newAttacker, newDefender];
  }
}
