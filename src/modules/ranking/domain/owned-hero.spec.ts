import * as fc from 'fast-check';
import { toOwnedColumns } from '../infrastructure/persistence/typeorm/owned-hero.mapper';
import { ExceedsLevelCapException } from './exceptions/exceeds-level-cap.exception';
import { SecondClaimRefusedException } from './exceptions/second-claim-refused.exception';
import { OwnedHero } from './owned-hero';

function catalog() {
  return {
    id: 7,
    atk: 900,
    def: 180,
    hp: 11000,
    spd: 210,
    critRate: 22,
  };
}

function makeOwned(level: number): OwnedHero {
  return OwnedHero.reconstitute(
    1,
    1,
    1,
    level,
    0,
    0,
    0,
    0,
    0,
    1600,
    1000,
    200,
    10000,
    200,
    20,
  );
}

describe('OwnedHero', () => {
  it('copies one catalog hero at level 0 and Elo 1600', () => {
    const owned = OwnedHero.claim(4, catalog().id, catalog(), null);

    expect(owned.level).toBe(0);
    expect(owned.elo).toBe(1600);
    expect(owned.heroId).toBe(7);
    expect(owned.atk).toBe(900);
    expect(owned.hp).toBe(11000);
    expect(owned.critRate).toBe(22);
  });

  it('refuses a second claim', () => {
    const source = catalog();
    const first = OwnedHero.claim(4, source.id, source, null);

    expect(() => OwnedHero.claim(4, source.id, source, first)).toThrow(
      SecondClaimRefusedException,
    );
  });

  it('persists a level-up from 0 as level 1', () => {
    const owned = OwnedHero.claim(4, catalog().id, catalog(), null);
    owned.levelUp();

    expect(toOwnedColumns(owned).level).toBe(1);
  });

  it('allocatePoints throws ExceedsLevelCapException when sum exceeds level', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        (level, atk, def, hp, spd, critRate) => {
          const total = atk + def + hp + spd + critRate;
          if (total <= level) return;

          const hero = makeOwned(level);
          const before = {
            atk: hero.atkPoint,
            def: hero.defPoint,
            hp: hero.hpPoint,
            spd: hero.spdPoint,
            crit: hero.critRatePoint,
          };

          expect(() =>
            hero.allocatePoints(atk, def, hp, spd, critRate),
          ).toThrow(ExceedsLevelCapException);
          expect(hero.atkPoint).toBe(before.atk);
          expect(hero.defPoint).toBe(before.def);
          expect(hero.hpPoint).toBe(before.hp);
          expect(hero.spdPoint).toBe(before.spd);
          expect(hero.critRatePoint).toBe(before.crit);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('accepts a point split that does not exceed level', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 50 }),
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        (level, atk, def, hp, spd, critRate) => {
          const total = atk + def + hp + spd + critRate;
          if (total > level) return;

          const hero = makeOwned(level);
          expect(() =>
            hero.allocatePoints(atk, def, hp, spd, critRate),
          ).not.toThrow();
          expect(hero.atk).toBe(1000 * (1 + 0.01 * atk));
          expect(hero.def).toBe(Math.round(200 * (1 + 0.023 * def)));
          expect(hero.hp).toBe(10000 * (1 + 0.0138 * hp));
          expect(hero.spd).toBe(200 * (1 + 0.01 * spd));
          expect(hero.critRate).toBe(20 + Math.round(0.25 * critRate));
        },
      ),
      { numRuns: 100 },
    );
  });
});
