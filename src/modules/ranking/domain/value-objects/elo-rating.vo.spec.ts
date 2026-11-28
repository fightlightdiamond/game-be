/**
 * Property-based tests for EloRating value object.
 * Validates: Requirements 8.2, 8.8, 13.4
 */
import * as fc from 'fast-check';
import { EloRating } from './elo-rating.vo';

describe('EloRating', () => {
  /**
   * Property 8: EloRating Conservation
   * |( homeRating + awayRating ) − ( newHome + newAway )| <= kFactor (20).
   * The ELO system is zero-sum within the kFactor transfer limit.
   * Validates: Requirements 8.2, 8.8, 13.4
   */
  it('Property 8: sum of ratings changes by at most kFactor (20) after a match', () => {
    const eloRatingArb = fc.integer({ min: 0, max: 3000 });

    fc.assert(
      fc.property(
        eloRatingArb,
        eloRatingArb,
        fc.constantFrom(1 as const, 0 as const),
        (homeVal, awayVal, outcome) => {
          const homeElo = new EloRating(homeVal);
          const awayElo = new EloRating(awayVal);

          const sumBefore = homeVal + awayVal;

          // Recalculate both sides consistently: home wins (outcome=1) or loses (outcome=0)
          const newHome = homeElo.recalculate(awayElo, outcome);
          const awayOutcome: 0 | 1 = outcome === 1 ? 0 : 1;
          const newAway = awayElo.recalculate(homeElo, awayOutcome);

          const sumAfter = newHome.getValue() + newAway.getValue();

          expect(Math.abs(sumBefore - sumAfter)).toBeLessThanOrEqual(20);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8b: EloRating Immutability
   * Original EloRating instance is unchanged after recalculate.
   * Validates: Requirements 8.2
   */
  it('Property 8b: recalculate does not mutate the original EloRating', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3000 }),
        fc.integer({ min: 0, max: 3000 }),
        fc.constantFrom(1 as const, 0 as const),
        (homeVal, awayVal, outcome) => {
          const homeElo = new EloRating(homeVal);
          const awayElo = new EloRating(awayVal);

          homeElo.recalculate(awayElo, outcome);

          expect(homeElo.getValue()).toBe(homeVal);
          expect(awayElo.getValue()).toBe(awayVal);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('static initial() returns EloRating with value 1600', () => {
    const initial = EloRating.initial();
    expect(initial.getValue()).toBe(1600);
  });
});
