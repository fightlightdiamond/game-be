import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Poseidon hero skill.
 *
 * Ports SkillService.Poseidon. Stacks up to 10 times; each stack boosts
 * ATK by 7.5 % and DEF by 2 %.
 */
export class PoseidonSkill implements SkillStrategy {
  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot] {
    if (defender.effectResistance || attacker.intrinsicStatus === -1) {
      return [attacker, defender];
    }

    if (attacker.intrinsicStatus < 10) {
      const newIntrinsicStatus = attacker.intrinsicStatus + 1;
      const newAtk = Math.round(attacker.atk * 1.075);
      const newDef = Math.round(attacker.def * 1.02);

      return [
        attacker
          .withIntrinsicStatus(newIntrinsicStatus)
          .withAtk(newAtk)
          .withDef(newDef),
        defender,
      ];
    }

    return [attacker, defender];
  }
}
