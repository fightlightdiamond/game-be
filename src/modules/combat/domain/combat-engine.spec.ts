import * as fc from 'fast-check';
import { CombatEngine } from './combat-engine';
import { Fighter } from './fighter';
import { MathRandomSource, SequenceRandomSource } from './random-source';
import { TraitRegistry } from './traits';

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

function fighter(
  id: number,
  name: string,
  maxHp: number,
  currentHp = maxHp,
  baseAtk = 100,
  currentAtk = baseAtk,
  baseDef = 0,
  currentDef = baseDef,
  spd = 10,
  critRate = 0,
  critDmg = 100,
  dodge = 0,
): Fighter {
  return new Fighter(
    id,
    name,
    maxHp,
    currentHp,
    baseAtk,
    currentAtk,
    baseDef,
    currentDef,
    spd,
    critRate,
    critDmg,
    dodge,
    0,
    0,
  );
}

const fighterArb = fc
  .record({
    id: fc.integer({ min: 1, max: 1000 }),
    name: fc.constantFrom(...HERO_NAMES),
    maxHp: fc.integer({ min: 1, max: 20000 }),
    atk: fc.integer({ min: 1, max: 5000 }),
    def: fc.integer({ min: 0, max: 3000 }),
    spd: fc.integer({ min: 1, max: 100 }),
    critRate: fc.integer({ min: 0, max: 100 }),
    critDmg: fc.integer({ min: 100, max: 300 }),
    dodge: fc.integer({ min: 0, max: 100 }),
    effectResistance: fc.integer({ min: 0, max: 1 }),
    intrinsicStatus: fc.integer({ min: 0, max: 5 }),
  })
  .map(
    (row) =>
      new Fighter(
        row.id,
        row.name,
        row.maxHp,
        row.maxHp,
        row.atk,
        row.atk,
        row.def,
        row.def,
        row.spd,
        row.critRate,
        row.critDmg,
        row.dodge,
        row.effectResistance,
        row.intrinsicStatus,
      ),
  );

describe('CombatEngine', () => {
  const engine = new CombatEngine(new TraitRegistry(), new MathRandomSource());

  it('stops when the turn number reaches 20', () => {
    fc.assert(
      fc.property(fighterArb, fighterArb, (home, away) => {
        const result = engine.simulate(home, away);
        expect(result.turnNumber).toBeGreaterThanOrEqual(1);
        expect(result.turnNumber).toBeLessThanOrEqual(20);
        expect(result.turns.every((turn) => turn.turnNumber < 20)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('does not change the fighters passed in', () => {
    fc.assert(
      fc.property(fighterArb, fighterArb, (home, away) => {
        const before = [home, away].map((unit) => ({ ...unit }));
        engine.simulate(home, away);
        expect({ ...home }).toEqual(before[0]);
        expect({ ...away }).toEqual(before[1]);
      }),
      { numRuns: 100 },
    );
  });

  it('names the winner and the loser as the two fighters', () => {
    fc.assert(
      fc.property(fighterArb, fighterArb, (home, away) => {
        const result = engine.simulate(
          new Fighter(
            1,
            home.name,
            home.maxHp,
            home.currentHp,
            home.baseAtk,
            home.currentAtk,
            home.baseDef,
            home.currentDef,
            home.spd,
            home.critRate,
            home.critDmg,
            home.dodge,
            home.effectResistance,
            home.intrinsicStatus,
          ),
          new Fighter(
            2,
            away.name,
            away.maxHp,
            away.currentHp,
            away.baseAtk,
            away.currentAtk,
            away.baseDef,
            away.currentDef,
            away.spd,
            away.critRate,
            away.critDmg,
            away.dodge,
            away.effectResistance,
            away.intrinsicStatus,
          ),
        );
        expect([1, 2]).toContain(result.winnerId);
        expect([1, 2]).toContain(result.loserId);
        expect(result.winnerId).not.toBe(result.loserId);
      }),
      { numRuns: 100 },
    );
  });

  it('applies Fenrir before the blow: crit rate +5 and crit damage +20', () => {
    const registry = new TraitRegistry();
    const result = registry
      .get('Fenrir')
      .apply(
        fighter(1, 'Fenrir', 1000, 1000, 100, 100, 0, 0, 10, 20, 150),
        fighter(2, 'Hell', 1000),
        { turnNumber: 1, random: new SequenceRandomSource([]) },
      );
    expect(result.attacker.critRate).toBe(25);
    expect(result.attacker.critDmg).toBe(170);
    expect(result.attacker.intrinsicStatus).toBe(1);
    expect(result.defender.currentHp).toBe(1000);
  });

  it('gives a speed tie to away', () => {
    const tied = new CombatEngine(
      new TraitRegistry(),
      new SequenceRandomSource([50, 100]),
    );
    const result = tied.simulate(
      fighter(1, 'Hell', 100, 100, 5000, 5000, 0, 0, 10, 0, 100, 0),
      fighter(2, 'Hell', 100, 100, 5000, 5000, 0, 0, 10, 0, 100, 0),
    );
    expect(result.winnerId).toBe(2);
    expect(result.loserId).toBe(1);
    expect(result.turns).toHaveLength(1);
    expect(result.turns[0].attackerId).toBe(2);
  });

  it('gives equal remaining health to away and stops at turn 20', () => {
    const stalled = new CombatEngine(
      new TraitRegistry(),
      new MathRandomSource(),
    );
    const result = stalled.simulate(
      fighter(1, 'Hell', 1000, 1000, 10, 10, 0, 0, 10, 0, 100, 100),
      fighter(2, 'Hell', 1000, 1000, 10, 10, 0, 0, 10, 0, 100, 100),
    );
    expect(result.turnNumber).toBe(20);
    expect(result.turns.every((turn) => turn.turnNumber <= 19)).toBe(true);
    expect(result.winnerId).toBe(2);
  });
});
