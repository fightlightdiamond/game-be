/**
 * Property-based tests for CombatEngine.
 * Validates: Requirements 6.2, 6.3, 6.10, 12.1, 12.4, 13.1, 13.6
 */
import * as fc from 'fast-check';
import { HeroSnapshot } from '../domain/value-objects/hero-snapshot.vo';
import { CombatEngine } from './combat-engine.service';
import { SkillRegistry } from './skill-registry.service';

const HERO_NAMES = [
  'Hell',
  'Sphinx',
  'Darklord',
  'Valkyrie',
  'Poseidon',
  'Phoenix',
  'Chiron',
  'Hera',
  'Fenrir',
  'Amon',
  'Nezha',
];

/** Arbitrary that produces a valid HeroSnapshot */
const heroSnapshotArb = fc
  .record({
    id: fc.integer({ min: 1, max: 1000 }),
    name: fc.constantFrom(...HERO_NAMES),
    hp: fc.integer({ min: 1, max: 20000 }),
    atk: fc.integer({ min: 1, max: 5000 }),
    def: fc.integer({ min: 0, max: 3000 }),
    spd: fc.integer({ min: 1, max: 100 }),
    critRate: fc.float({ min: 0, max: 1, noNaN: true }),
    critDmg: fc.integer({ min: 100, max: 300 }),
    atkHealing: fc.float({ min: 0, max: 1, noNaN: true }),
    takeDmgHealing: fc.float({ min: 0, max: 1, noNaN: true }),
    dodge: fc.float({ min: 0, max: 0.5, noNaN: true }),
    acc: fc.float({ min: 0, max: 1, noNaN: true }),
    cc: fc.float({ min: 0, max: 1, noNaN: true }),
    effectResistance: fc.float({ min: 0, max: 1, noNaN: true }),
    intrinsicStatus: fc.integer({ min: 0, max: 5 }),
  })
  .map(
    (r) =>
      new HeroSnapshot(
        r.id,
        r.name,
        r.hp,
        r.atk,
        r.def,
        r.spd,
        r.critRate,
        r.critDmg,
        r.atkHealing,
        r.takeDmgHealing,
        r.dodge,
        r.acc,
        r.cc,
        r.effectResistance,
        r.intrinsicStatus,
      ),
  );

describe('CombatEngine', () => {
  let engine: CombatEngine;

  beforeEach(() => {
    const registry = new SkillRegistry();
    engine = new CombatEngine(registry);
  });

  /**
   * Property 1: CombatEngine Termination
   * For all valid HeroSnapshot pairs, turnNumber is in [1, 20].
   * Validates: Requirements 6.2, 6.10, 13.1
   */
  it('Property 1: turnNumber is always between 1 and 20 inclusive', () => {
    fc.assert(
      fc.property(heroSnapshotArb, heroSnapshotArb, (home, away) => {
        const result = engine.simulate(home, away);
        expect(result.turnNumber).toBeGreaterThanOrEqual(1);
        expect(result.turnNumber).toBeLessThanOrEqual(20);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: CombatEngine Input Immutability
   * After simulate(home, away), both snapshot objects are unchanged.
   * Validates: Requirements 6.3, 12.1
   */
  it('Property 2: input HeroSnapshots are not mutated by simulate', () => {
    fc.assert(
      fc.property(heroSnapshotArb, heroSnapshotArb, (home, away) => {
        const homeId = home.id;
        const homeName = home.name;
        const homeHp = home.hp;
        const homeAtk = home.atk;
        const homeDef = home.def;
        const homeSpd = home.spd;

        const awayId = away.id;
        const awayName = away.name;
        const awayHp = away.hp;
        const awayAtk = away.atk;
        const awayDef = away.def;
        const awaySpd = away.spd;

        engine.simulate(home, away);

        // All fields on home unchanged
        expect(home.id).toBe(homeId);
        expect(home.name).toBe(homeName);
        expect(home.hp).toBe(homeHp);
        expect(home.atk).toBe(homeAtk);
        expect(home.def).toBe(homeDef);
        expect(home.spd).toBe(homeSpd);

        // All fields on away unchanged
        expect(away.id).toBe(awayId);
        expect(away.name).toBe(awayName);
        expect(away.hp).toBe(awayHp);
        expect(away.atk).toBe(awayAtk);
        expect(away.def).toBe(awayDef);
        expect(away.spd).toBe(awaySpd);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: CombatEngine Result Validity
   * winnerId and loserId are the IDs of the two input heroes.
   * Validates: Requirements 6.1, 12.4
   */
  it('Property 3: result winnerId and loserId are the input hero IDs', () => {
    fc.assert(
      fc.property(heroSnapshotArb, heroSnapshotArb, (home, away) => {
        // Give heroes distinct IDs so we can verify the result references them
        const h = new HeroSnapshot(
          1,
          home.name,
          home.hp,
          home.atk,
          home.def,
          home.spd,
          home.critRate,
          home.critDmg,
          home.atkHealing,
          home.takeDmgHealing,
          home.dodge,
          home.acc,
          home.cc,
          home.effectResistance,
          home.intrinsicStatus,
        );
        const a = new HeroSnapshot(
          2,
          away.name,
          away.hp,
          away.atk,
          away.def,
          away.spd,
          away.critRate,
          away.critDmg,
          away.atkHealing,
          away.takeDmgHealing,
          away.dodge,
          away.acc,
          away.cc,
          away.effectResistance,
          away.intrinsicStatus,
        );

        const result = engine.simulate(h, a);

        const heroIds = [h.id, a.id];
        expect(heroIds).toContain(result.winnerId);
        expect(heroIds).toContain(result.loserId);
        expect(result.winnerId).not.toBe(result.loserId);
      }),
      { numRuns: 100 },
    );
  });
});
