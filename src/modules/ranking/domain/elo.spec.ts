import * as fc from 'fast-check';
import { nextElo } from './elo';

describe('nextElo', () => {
  it('changes the sum of the two numbers by at most 20', () => {
    const rating = fc.integer({ min: 0, max: 3000 });

    fc.assert(
      fc.property(
        rating,
        rating,
        fc.constantFrom(1 as const, 0 as const),
        (home, away, outcome) => {
          const awayOutcome: 0 | 1 = outcome === 1 ? 0 : 1;
          const sumBefore = home + away;
          const sumAfter =
            nextElo(home, away, outcome) + nextElo(away, home, awayOutcome);

          expect(Math.abs(sumBefore - sumAfter)).toBeLessThanOrEqual(20);
          expect(home + away).toBe(sumBefore);
        },
      ),
      { numRuns: 100 },
    );
  });
});
