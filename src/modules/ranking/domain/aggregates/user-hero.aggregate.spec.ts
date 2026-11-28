/**
 * Property-based tests for UserHero aggregate (level cap enforcement).
 * Validates: Requirements 8.3, 13.4
 */
import * as fc from 'fast-check';
import { EloRating } from '../value-objects/elo-rating.vo';
import { ExceedsLevelCapException } from '../exceptions/exceeds-level-cap.exception';
import { UserHero } from './user-hero.aggregate';

/** Create a UserHero at a given level with zero skill points and default stats */
function makeUserHero(level: number): UserHero {
  return new UserHero(
    1,
    1,
    1,
    level,
    0,
    0,
    0,
    0,
    0,
    EloRating.initial(),
    1000,
    200,
    10000,
    200,
    20,
  );
}

describe('UserHero', () => {
  /**
   * Property 10: UserHero Level Cap Enforcement
   * When sum(atk, def, hp, spd, critRate) > level, allocatePoints throws
   * ExceedsLevelCapException and state is unchanged.
   * Validates: Requirements 8.3
   */
  it('Property 10: allocatePoints throws ExceedsLevelCapException when sum exceeds level', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }), // level
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        (level, atk, def, hp, spd, critRate) => {
          const total = atk + def + hp + spd + critRate;
          if (total <= level) return; // skip valid allocations for this property

          const hero = makeUserHero(level);

          // Record state before the failing call
          const beforeAtk = hero.atkPoint;
          const beforeDef = hero.defPoint;
          const beforeHp = hero.hpPoint;
          const beforeSpd = hero.spdPoint;
          const beforeCritRate = hero.critRatePoint;

          expect(() =>
            hero.allocatePoints(atk, def, hp, spd, critRate),
          ).toThrow(ExceedsLevelCapException);

          // State must be unchanged after the failed allocation
          expect(hero.atkPoint).toBe(beforeAtk);
          expect(hero.defPoint).toBe(beforeDef);
          expect(hero.hpPoint).toBe(beforeHp);
          expect(hero.spdPoint).toBe(beforeSpd);
          expect(hero.critRatePoint).toBe(beforeCritRate);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('Property 10b: valid allocations (sum <= level) succeed without throwing', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 50 }), // level large enough to allow real allocations
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        fc.integer({ min: 0, max: 2 }),
        (level, atk, def, hp, spd, critRate) => {
          const total = atk + def + hp + spd + critRate;
          if (total > level) return; // skip over-budget cases for this property

          const hero = makeUserHero(level);
          expect(() =>
            hero.allocatePoints(atk, def, hp, spd, critRate),
          ).not.toThrow();

          expect(hero.atkPoint).toBe(atk);
          expect(hero.defPoint).toBe(def);
          expect(hero.hpPoint).toBe(hp);
          expect(hero.spdPoint).toBe(spd);
          expect(hero.critRatePoint).toBe(critRate);
        },
      ),
      { numRuns: 100 },
    );
  });
});
