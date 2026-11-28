import { PaidStake } from './events/rewards-paid.event';
import { Stake } from './stake';

export function winningPayouts(stakes: Stake[], winnerId: number): PaidStake[] {
  return stakes
    .filter((stake) => stake.heroId === winnerId)
    .map((stake) => ({
      accountId: stake.accountId,
      stakeAmount: stake.amount,
      payout: stake.amount * 2,
    }));
}
