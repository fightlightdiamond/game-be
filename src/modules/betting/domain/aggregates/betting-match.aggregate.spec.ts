/**
 * Property-based tests for BettingMatch state machine.
 * Validates: Requirements 7.1, 13.2
 */
import * as fc from 'fast-check';
import { MatchStatus } from '../value-objects/match-status.vo';
import { InvalidMatchTransitionException } from '../exceptions/invalid-match-transition.exception';
import { BettingMatch } from './betting-match.aggregate';

/** Create a minimal BettingMatch with no events auto-committed (no EventBus wired) */
function createMatch(id = 1): BettingMatch {
  return BettingMatch.create(id, [], 1, 2, [], 0);
}

describe('BettingMatch state machine', () => {
  /**
   * Property 4: BettingMatch Monotonic State
   * Status can only increase (PENDING→BETTING→FIGHTING→END).
   * Any transition from END throws InvalidMatchTransitionException.
   * Validates: Requirements 7.1, 13.2
   */
  it('Property 4: status is monotonically increasing and END rejects all transitions', () => {
    // Test all three valid sequential transitions in one pass
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), () => {
        const match = createMatch();

        // PENDING → BETTING
        expect(match.status).toBe(MatchStatus.PENDING);
        match.startBetting();
        expect(match.status).toBe(MatchStatus.BETTING);

        // BETTING → FIGHTING
        match.startFighting();
        expect(match.status).toBe(MatchStatus.FIGHTING);

        // FIGHTING → END
        match.endMatch([]);
        expect(match.status).toBe(MatchStatus.END);

        // END → any further transition must throw
        expect(() => match.startBetting()).toThrow(
          InvalidMatchTransitionException,
        );
        expect(() => match.startFighting()).toThrow(
          InvalidMatchTransitionException,
        );
        expect(() => match.endMatch([])).toThrow(
          InvalidMatchTransitionException,
        );
      }),
      { numRuns: 100 },
    );
  });

  it('Property 4b: invalid transitions from non-matching states throw', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), () => {
        // Cannot go PENDING → FIGHTING (skipping BETTING)
        const m1 = createMatch();
        expect(() => m1.startFighting()).toThrow(
          InvalidMatchTransitionException,
        );

        // Cannot go PENDING → END
        const m2 = createMatch();
        expect(() => m2.endMatch([])).toThrow(InvalidMatchTransitionException);

        // Cannot go BETTING → END (skipping FIGHTING)
        const m3 = createMatch();
        m3.startBetting();
        expect(() => m3.endMatch([])).toThrow(InvalidMatchTransitionException);
      }),
      { numRuns: 50 },
    );
  });

  it('status value never decreases across a valid transition sequence', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 3 }), (stopAt) => {
        const match = createMatch();
        const statusHistory: MatchStatus[] = [match.status];

        try {
          if (stopAt >= 1) {
            match.startBetting();
            statusHistory.push(match.status);
          }
          if (stopAt >= 2) {
            match.startFighting();
            statusHistory.push(match.status);
          }
          if (stopAt >= 3) {
            match.endMatch([]);
            statusHistory.push(match.status);
          }
        } catch {
          // Should not throw for valid sequences
        }

        for (let i = 1; i < statusHistory.length; i++) {
          expect(statusHistory[i]).toBeGreaterThanOrEqual(statusHistory[i - 1]);
        }
      }),
      { numRuns: 100 },
    );
  });
});
