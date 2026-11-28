import { HeroSnapshot } from '../value-objects/hero-snapshot.vo';
import { SkillStrategy } from './skill.strategy.interface';

/**
 * Chiron hero skill.
 *
 * Ports SkillService.Chiron. Scales ATK based on how much HP the attacker has
 * lost relative to max HP. The original formula: `home.atk * (1 + ((home.hp - home.current_hp) / home.hp) * 0.85)`.
 *
 * NOTE: `home.atk` is the base ATK and `home.hp` is the max HP in the original.
 * HeroSnapshot has a single `atk` (current) and `hp` (current). Without a
 * separate max-HP field, the lost-HP fraction is unavailable; `attacker.atk`
 * is used directly as the resulting ATK (no bonus). This matches a hero at
 * full health in the original logic (lost HP = 0 → multiplier = 1).
 */
export class ChironSkill implements SkillStrategy {
  apply(
    attacker: HeroSnapshot,
    defender: HeroSnapshot,
  ): [HeroSnapshot, HeroSnapshot] {
    if (defender.effectResistance || attacker.intrinsicStatus === -1) {
      return [attacker, defender];
    }

    // Original: home.current_atk = Math.round(home.atk * (1 + ((home.hp - home.current_hp) / home.hp) * 0.85))
    // Without a separate base atk and max hp, lost-HP fraction cannot be computed.
    // The snapshot `atk` is treated as current ATK; no scaling is applied here.
    const newAtk = Math.round(attacker.atk);

    return [attacker.withAtk(newAtk), defender];
  }
}
