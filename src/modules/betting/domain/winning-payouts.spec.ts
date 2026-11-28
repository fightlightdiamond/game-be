import * as fc from 'fast-check';
import { Stake } from './stake';
import { winningPayouts } from './winning-payouts';

describe('winningPayouts', () => {
  it('pays each winning stake amount × 2 and nothing for the other hero', () => {
    const stakeArb = fc
      .record({
        id: fc.integer({ min: 1, max: 10_000 }),
        accountId: fc.integer({ min: 1, max: 1_000 }),
        heroId: fc.integer({ min: 1, max: 2 }),
        amount: fc.integer({ min: 1, max: 100_000 }),
      })
      .map(
        (row) => new Stake(row.id, row.accountId, 1, row.heroId, row.amount),
      );

    fc.assert(
      fc.property(
        fc.array(stakeArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 2 }),
        (stakes, winnerId) => {
          const payouts = winningPayouts(stakes, winnerId);
          const total = payouts.reduce((sum, row) => sum + row.payout, 0);
          const winningSum = stakes
            .filter((stake) => stake.heroId === winnerId)
            .reduce((sum, stake) => sum + stake.amount, 0);
          expect(total).toBe(winningSum * 2);
          expect(
            payouts.every((row) => row.payout === row.stakeAmount * 2),
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
