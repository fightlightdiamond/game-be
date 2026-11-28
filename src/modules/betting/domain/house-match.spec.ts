import { HouseMatch } from './house-match';
import { Phase } from './phase';
import { Stake } from './stake';
import { StakeRefusedException } from './exceptions/stake-refused.exception';

const fighters = [
  { id: 4, name: 'Fenrir', element: 'fire', position: 'front' },
  { id: 9, name: 'Hell', element: 'dark', position: 'back' },
];

function opened(): HouseMatch {
  return HouseMatch.open(
    fighters,
    { winnerId: 9, loserId: 4, turns: [{ turnNumber: 1 }], turnNumber: 2 },
    '1000',
  ).withId(7);
}

describe('HouseMatch', () => {
  it('hides the winner while Open and keeps the stored result', () => {
    const match = opened();

    expect(match.toPublic().winnerId).toBe(0);
    expect(match.toPublic().turns).toEqual([]);
    expect(match.storedWinnerId).toBe(9);
    expect(match.storedTurns).toEqual([{ turnNumber: 1 }]);
    expect(match.bettingOpened()).toEqual({
      matchId: 7,
      fighters,
      openedAt: '1000',
    });
  });

  it('refuses a stake once the fight is Revealed', () => {
    const match = opened();
    match.reveal();

    expect(() => match.placeStake(3, 9, 10)).toThrow(StakeRefusedException);
    expect(match.toPublic().winnerId).toBe(9);
    expect(match.toPublic().turns).toEqual([{ turnNumber: 1 }]);
  });

  it('refuses a stake on a hero that is not in the match', () => {
    expect(() => opened().placeStake(3, 99, 10)).toThrow(StakeRefusedException);
  });

  it('pays amount × 2 once, and a second settle pays nothing', () => {
    const match = opened();
    match.reveal();
    const stakes = [new Stake(1, 3, 7, 9, 10), new Stake(2, 8, 7, 4, 15)];

    const paid = match.settle(stakes);
    const again = match.settle(stakes);

    expect(paid.payouts).toEqual([
      { accountId: 3, stakeAmount: 10, payout: 20 },
    ]);
    expect(again).toBeNull();
    expect(match.currentPhase).toBe(Phase.Settled);
  });
});
