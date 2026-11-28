import { Injectable } from '@nestjs/common';
import { HeroSnapshot } from '../domain/value-objects/hero-snapshot.vo';
import { CombatResult } from '../domain/value-objects/combat-result.vo';
import { TurnLog } from '../domain/value-objects/turn-log.vo';
import { probability } from '../../../common/utils/hero.util';
import { SkillRegistry } from './skill-registry.service';

/**
 * Mutable working state for one hero during a simulation.
 * Wraps the immutable HeroSnapshot and tracks per-simulation-mutable values.
 */
interface WorkingHero {
  snapshot: HeroSnapshot; // immutable base stats (never mutated)
  currentHp: number; // mutable HP during simulation
  currentAtk: number; // can be modified by skills each turn
  currentDef: number; // can be modified by skills each turn
  currentCritRate: number;
  currentCritDmg: number;
  intrinsicStatus: number; // tracks skill state across turns
  effectResistance: number;
}

@Injectable()
export class CombatEngine {
  constructor(private readonly skillRegistry: SkillRegistry) {}

  /**
   * Runs a full combat simulation between two heroes.
   * Neither input snapshot is mutated; all state is local.
   *
   * @param home - The home hero snapshot
   * @param away - The away hero snapshot
   * @returns CombatResult with winner, loser, all turn logs, and turn count
   */
  simulate(home: HeroSnapshot, away: HeroSnapshot): CombatResult {
    // Create local working copies — inputs are never mutated
    let homeWorking: WorkingHero = this.toWorkingHero(home);
    let awayWorking: WorkingHero = this.toWorkingHero(away);

    const turns: TurnLog[] = [];
    let turnNumber = 1;
    const MAX_TURNS = 20;

    while (
      homeWorking.currentHp > 0 &&
      awayWorking.currentHp > 0 &&
      turnNumber <= MAX_TURNS
    ) {
      // Determine attacker and defender by speed; home wins ties
      let attacker: WorkingHero;
      let defender: WorkingHero;

      if (homeWorking.snapshot.spd >= awayWorking.snapshot.spd) {
        attacker = homeWorking;
        defender = awayWorking;
      } else {
        attacker = awayWorking;
        defender = homeWorking;
      }

      // First attack: faster hero attacks slower hero
      const [firstLog, updatedAttacker, updatedDefender] = this.executeTurn(
        attacker,
        defender,
        turnNumber,
      );
      turns.push(firstLog);

      // Write back updated state
      if (attacker === homeWorking) {
        homeWorking = updatedAttacker;
        awayWorking = updatedDefender;
      } else {
        awayWorking = updatedAttacker;
        homeWorking = updatedDefender;
      }

      // Check if defender died
      if (updatedDefender.currentHp <= 0) {
        break;
      }

      // Second attack: the other hero retaliates
      const [secondLog, updatedAttacker2, updatedDefender2] = this.executeTurn(
        updatedDefender,
        updatedAttacker,
        turnNumber,
      );
      turns.push(secondLog);

      // Write back updated state for the return attack
      if (updatedDefender === homeWorking) {
        homeWorking = updatedAttacker2;
        awayWorking = updatedDefender2;
      } else {
        awayWorking = updatedAttacker2;
        homeWorking = updatedDefender2;
      }

      if (updatedDefender2.currentHp <= 0) {
        break;
      }

      turnNumber++;
    }

    // Clamp turnNumber to MAX_TURNS: the counter increments before the while
    // condition re-evaluates, so it can reach MAX_TURNS+1 when the full 20
    // rounds complete without a knockout.
    const finalTurnNumber = Math.min(turnNumber, MAX_TURNS);

    // Determine winner: higher remaining HP wins; home wins ties
    const homeWins = homeWorking.currentHp >= awayWorking.currentHp;
    const winnerId = homeWins ? home.id : away.id;
    const loserId = homeWins ? away.id : home.id;

    return new CombatResult(winnerId, loserId, turns, finalTurnNumber);
  }

  /**
   * Executes a single attack from attacker onto defender.
   * Returns updated working copies of both heroes and the turn log.
   * Neither input is mutated.
   */
  private executeTurn(
    attacker: WorkingHero,
    defender: WorkingHero,
    turnNumber: number,
  ): [TurnLog, WorkingHero, WorkingHero] {
    let isCrit = false;
    let isActiveSkill = false;
    let damage = 0;
    let skillDamage = 0;

    // Build HeroSnapshots reflecting current working state so skills see live stats
    const attackerSnapshot = this.toSnapshot(attacker);
    const defenderSnapshot = this.toSnapshot(defender);

    // Apply skill strategy — may return modified snapshots
    const skillImpl = this.skillRegistry.get(attacker.snapshot.name);
    const [postSkillAttacker, postSkillDefender] = skillImpl.apply(
      attackerSnapshot,
      defenderSnapshot,
    );

    // Check if skill activated (attacker or defender stats changed)
    if (
      postSkillAttacker.atk !== attackerSnapshot.atk ||
      postSkillAttacker.def !== attackerSnapshot.def ||
      postSkillDefender.hp !== defenderSnapshot.hp ||
      postSkillDefender.def !== defenderSnapshot.def
    ) {
      isActiveSkill = true;
    }

    // Apply skill-modified stats back to working heroes
    const updatedAttacker: WorkingHero = {
      ...attacker,
      currentAtk: postSkillAttacker.atk,
      currentDef: postSkillAttacker.def,
      currentCritRate: postSkillAttacker.critRate,
      currentCritDmg: postSkillAttacker.critDmg,
      intrinsicStatus: postSkillAttacker.intrinsicStatus,
      effectResistance: postSkillAttacker.effectResistance,
    };

    // Track any HP changes the skill applied to the defender (e.g. direct skill damage)
    const skillHpDelta = defenderSnapshot.hp - postSkillDefender.hp;
    if (skillHpDelta > 0) {
      skillDamage = skillHpDelta;
      isActiveSkill = true;
    }

    let updatedDefender: WorkingHero = {
      ...defender,
      currentHp: defender.currentHp - skillDamage,
      currentAtk: postSkillDefender.atk,
      currentDef: postSkillDefender.def,
      currentCritRate: postSkillDefender.critRate,
      currentCritDmg: postSkillDefender.critDmg,
      intrinsicStatus: postSkillDefender.intrinsicStatus,
      effectResistance: postSkillDefender.effectResistance,
    };

    // Random dodge check: damage is skipped when defender dodges
    const dodgeRoll = probability();
    if (dodgeRoll > updatedDefender.snapshot.dodge) {
      // Calculate base damage
      damage = updatedAttacker.currentAtk - updatedDefender.currentDef;

      // Apply crit
      const critRoll = probability();
      if (critRoll <= updatedAttacker.currentCritRate) {
        damage = Math.round((damage * updatedAttacker.currentCritDmg) / 100);
        isCrit = true;
      }

      // Minimum 1 damage
      if (damage < 1) {
        damage = 1;
      }

      updatedDefender = {
        ...updatedDefender,
        currentHp: updatedDefender.currentHp - damage,
      };
    }

    const log = new TurnLog(
      turnNumber,
      attacker.snapshot.id,
      defender.snapshot.id,
      damage,
      skillDamage,
      updatedAttacker.currentHp,
      updatedDefender.currentHp,
      isCrit,
      isActiveSkill,
    );

    return [log, updatedAttacker, updatedDefender];
  }

  /** Creates a WorkingHero from an immutable HeroSnapshot. */
  private toWorkingHero(snapshot: HeroSnapshot): WorkingHero {
    return {
      snapshot,
      currentHp: snapshot.hp,
      currentAtk: snapshot.atk,
      currentDef: snapshot.def,
      currentCritRate: snapshot.critRate,
      currentCritDmg: snapshot.critDmg,
      intrinsicStatus: snapshot.intrinsicStatus,
      effectResistance: snapshot.effectResistance,
    };
  }

  /**
   * Builds a HeroSnapshot from a WorkingHero's current mutable state.
   * Used to pass live stats into skill strategies.
   */
  private toSnapshot(hero: WorkingHero): HeroSnapshot {
    return new HeroSnapshot(
      hero.snapshot.id,
      hero.snapshot.name,
      hero.currentHp,
      hero.currentAtk,
      hero.currentDef,
      hero.snapshot.spd,
      hero.currentCritRate,
      hero.currentCritDmg,
      hero.snapshot.atkHealing,
      hero.snapshot.takeDmgHealing,
      hero.snapshot.dodge,
      hero.snapshot.acc,
      hero.snapshot.cc,
      hero.effectResistance,
      hero.intrinsicStatus,
    );
  }
}
