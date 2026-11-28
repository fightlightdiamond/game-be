import { Phase } from '../../../domain/phase';

/** Legacy matches.status numbers. The domain speaks Open, Revealed, Settled. */
export const OPEN_COLUMN = 1;
export const REVEALED_COLUMN = 2;
export const SETTLED_COLUMN = 3;

export function phaseToColumn(phase: Phase): number {
  if (phase === Phase.Revealed) {
    return REVEALED_COLUMN;
  }
  if (phase === Phase.Settled) {
    return SETTLED_COLUMN;
  }
  return OPEN_COLUMN;
}

export function columnToPhase(status: number): Phase {
  if (status === REVEALED_COLUMN) {
    return Phase.Revealed;
  }
  if (status === SETTLED_COLUMN) {
    return Phase.Settled;
  }
  return Phase.Open;
}
