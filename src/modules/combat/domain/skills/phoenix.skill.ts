import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Phoenix hero skill.
 *
 * Ports SkillService.Phoenix. Deals damage equal to 9 % of the attacker's
 * lost HP (max HP minus current HP).
 *
 * NOTE: The original uses `home.hp - home.current_hp` where `home.hp` is max HP.
 * HeroSnapshot has a single `hp` field (current HP); there is no max-HP anchor.
 * The skill therefore cannot compute lost HP from the snapshot alone. The damage
 * formula is preserved structurally — `attacker.hp` acts as current HP; a
 * separate max-HP value is not available, so the skill deals 0 damage until
 * CombatEngine supplies a snapshot with a meaningful lost-HP value. This is a
 * known design limitation; the interface is kept faithful for future extension.
 */
export class PhoenixSkill implements SkillStrategy {
  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot] {
    if (defender.effectResistance || attacker.intrinsicStatus === -1) {
      return [attacker, defender];
    }

    // Original: skillDame = (home.hp - home.current_hp) * 0.09
    // Without a separate maxHp, we cannot compute lost HP here. Damage is 0.
    const skillDmg = Math.round(0 * 0.09);
    const newDefenderHp = defender.hp - skillDmg;

    return [attacker, defender.withHp(newDefenderHp)];
  }
}
