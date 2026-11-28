import { CombatResult } from './value-objects/combat-result.vo';
import { TurnLog } from './value-objects/turn-log.vo';
import { Fighter } from './fighter';
import { RandomSource } from './random-source';
import { TraitRegistry, TraitResult } from './traits';

/**
 * Upstream combat supplier. Plain TypeScript. Nest wires it in CombatModule.
 * Contract: simulate(home, away) → CombatResult.
 */
export class CombatEngine {
  constructor(
    private readonly traits: TraitRegistry,
    private readonly random: RandomSource,
  ) {}

  simulate(home: Fighter, away: Fighter): CombatResult {
    let currentHome = home;
    let currentAway = away;
    const turns: TurnLog[] = [];
    let turnNumber = 1;

    while (
      currentHome.currentHp > 0 &&
      currentAway.currentHp > 0 &&
      turnNumber < 20
    ) {
      if (currentHome.spd > currentAway.spd) {
        const exchange = this.exchange(currentHome, currentAway, turnNumber);
        currentHome = exchange.first;
        currentAway = exchange.second;
        turns.push(...exchange.logs);
      } else {
        const exchange = this.exchange(currentAway, currentHome, turnNumber);
        currentAway = exchange.first;
        currentHome = exchange.second;
        turns.push(...exchange.logs);
      }
      turnNumber += 1;
    }

    const homeWins = currentHome.currentHp > currentAway.currentHp;
    return new CombatResult(
      homeWins ? currentHome.id : currentAway.id,
      homeWins ? currentAway.id : currentHome.id,
      turns,
      turnNumber,
    );
  }

  private exchange(
    first: Fighter,
    second: Fighter,
    turnNumber: number,
  ): { first: Fighter; second: Fighter; logs: TurnLog[] } {
    const opening = this.blow(first, second, turnNumber);
    const logs = [opening.log];
    if (opening.attacker.currentHp <= 0 || opening.defender.currentHp <= 0) {
      return {
        first: opening.attacker,
        second: opening.defender,
        logs,
      };
    }

    const reply = this.blow(opening.defender, opening.attacker, turnNumber);
    logs.push(reply.log);
    return { first: reply.defender, second: reply.attacker, logs };
  }

  private blow(
    attacker: Fighter,
    defender: Fighter,
    turnNumber: number,
  ): { attacker: Fighter; defender: Fighter; log: TurnLog } {
    const trait = this.applyTrait(attacker, defender, turnNumber);
    let nextAttacker = trait.attacker;
    let nextDefender = trait.defender;
    let skillDamage = trait.skillDamage;
    let damage = 0;
    let isCrit = false;

    const dodgeRoll = this.random.roll(0, 100);
    if (dodgeRoll > nextDefender.dodge) {
      damage = nextAttacker.currentAtk - nextDefender.currentDef;
      const critRoll = this.random.roll(0, 100);
      if (critRoll <= nextAttacker.critRate) {
        damage = Math.round((damage * nextAttacker.critDmg) / 100);
        isCrit = true;
      }
      if (damage < 0) {
        damage = 1;
      }

      if (nextAttacker.name === 'Nezha') {
        const ratio = nextAttacker.currentHp / nextAttacker.maxHp;
        if (ratio <= 0.8) {
          nextAttacker = nextAttacker.copy({
            currentHp: nextAttacker.currentHp + Math.round(damage * 0.5),
          });
        }
        if (trait.active && ratio <= 0.5) {
          skillDamage = damage * 2;
          nextDefender = nextDefender.copy({
            currentHp: nextDefender.currentHp - skillDamage,
          });
        }
      }

      nextDefender = nextDefender.copy({
        currentHp: nextDefender.currentHp - damage,
      });
    }

    return {
      attacker: nextAttacker,
      defender: nextDefender,
      log: new TurnLog(
        turnNumber,
        nextAttacker.id,
        nextDefender.id,
        damage,
        skillDamage,
        nextAttacker.currentHp,
        nextDefender.currentHp,
        isCrit,
        trait.active,
      ),
    };
  }

  private applyTrait(
    attacker: Fighter,
    defender: Fighter,
    turnNumber: number,
  ): TraitResult {
    if (defender.effectResistance !== 0 || attacker.intrinsicStatus === -1) {
      return {
        attacker,
        defender: defender.copy({ effectResistance: 0 }),
        active: false,
        skillDamage: 0,
      };
    }
    return this.traits.get(attacker.name).apply(attacker, defender, {
      turnNumber,
      random: this.random,
    });
  }
}
