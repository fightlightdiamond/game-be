/**
 * Property-based tests for RewardPolicy.
 * Validates: Requirements 7.8, 13.5
 */
import * as fc from 'fast-check';
import { Bet } from '../entities/bet.entity';
import { RewardPolicy } from './reward-policy.service';

describe('RewardPolicy', () => {
  let policy: RewardPolicy;

  beforeEach(() => {
    policy = new RewardPolicy();
  });

  /**
   * Property 9: RewardPolicy No-Money-Creation
   * The total payout is at most the sum of winning bet balances × 2.
   * Validates: Requirements 7.8, 13.5
   */
  it('Property 9: total payout never exceeds winning bet sum × 2', () => {
    const betArb = fc
      .record({
        id: fc.integer({ min: 1, max: 10_000 }),
        userId: fc.integer({ min: 1, max: 1_000 }),
        heroId: fc.integer({ min: 1, max: 2 }), // hero 1 or hero 2
        balance: fc.integer({ min: 1, max: 100_000 }),
      })
      .map((r) => new Bet(r.id, r.userId, 1, r.heroId, r.balance));

    fc.assert(
      fc.property(
        fc.array(betArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 2 }), // winnerId is 1 or 2
        (bets, winnerId) => {
          const payouts = policy.calculatePayouts(bets, winnerId);

          const totalPayout = Array.from(payouts.values()).reduce(
            (sum, p) => sum + p,
            0,
          );
          const winningBetSum = bets
            .filter((b) => b.heroId === winnerId)
            .reduce((sum, b) => sum + Number(b.balance), 0);

          expect(totalPayout).toBeLessThanOrEqual(winningBetSum * 2);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('each individual payout is exactly bet.balance × 2 (unique userIds)', () => {
    // The RewardPolicy uses userId as the Map key, so we must generate unique userIds
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 1000 }), {
          minLength: 1,
          maxLength: 10,
        }),
        fc.array(fc.integer({ min: 1, max: 50_000 }), {
          minLength: 1,
          maxLength: 10,
        }),
        (userIds: number[], balances: number[]) => {
          const winnerId = 1;
          const bets = userIds.map(
            (userId, i) =>
              new Bet(
                i + 1,
                userId,
                1,
                winnerId,
                balances[i % balances.length],
              ),
          );

          const payouts = policy.calculatePayouts(bets, winnerId);

          for (const bet of bets) {
            const payout = payouts.get(bet.userId);
            // Each unique userId maps to their own bet.balance × 2
            expect(payout).toBe(Number(bet.balance) * 2);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
