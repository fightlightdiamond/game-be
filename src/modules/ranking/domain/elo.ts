import Elo from '@studimax/elo';

const elo = new Elo({ kFactor: 20 });

export function nextElo(
  current: number,
  opponent: number,
  outcome: 0 | 1,
): number {
  const { Ra } = elo.calculateRating(current, opponent, outcome);
  return Ra;
}
