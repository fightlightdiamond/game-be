import { Phase } from '../phase';

export class FightRevealed {
  constructor(
    readonly matchId: number,
    readonly winnerId: number,
    readonly turns: readonly object[],
    readonly phase: Phase,
  ) {}
}
