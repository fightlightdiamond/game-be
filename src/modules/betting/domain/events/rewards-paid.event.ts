export type PaidStake = {
  accountId: number;
  stakeAmount: number;
  payout: number;
};

export class RewardsPaid {
  constructor(readonly matchId: number, readonly payouts: PaidStake[]) {}
}
