import { Bet } from '../entities/bet.entity';
import { GEM_DROP_CHANCE } from '../../../../shared/constants/gem-drop.constant';

export class RewardPolicy {
  /**
   * Calculate payouts for winning bets.
   * Returns a Map of userId → payout amount (bet.balance × 2).
   * Invariant: sum(payouts.values()) <= sum(winning bet balances) × 2
   */
  calculatePayouts(bets: Bet[], winnerId: number): Map<number, number> {
    const payouts = new Map<number, number>();
    for (const bet of bets) {
      if (bet.heroId === winnerId) {
        payouts.set(bet.userId, Number(bet.balance) * 2);
      }
    }
    return payouts;
  }

  /**
   * Check if a gem should be dropped for a winning bet.
   * GEM_DROP_CHANCE is an integer out of 100 (e.g. 5 → 5% chance).
   * A random integer in [1, 100] is compared: drop occurs when r <= GEM_DROP_CHANCE.
   */
  shouldDropGem(): boolean {
    return Math.random() * 100 < GEM_DROP_CHANCE;
  }
}
