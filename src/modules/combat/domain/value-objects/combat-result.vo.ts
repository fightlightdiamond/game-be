import { TurnLog } from './turn-log.vo';

/**
 * Immutable result of a CombatEngine simulation.
 * No NestJS decorators — pure TypeScript.
 */
export class CombatResult {
  constructor(
    public readonly winnerId: number,
    public readonly loserId: number,
    public readonly turns: TurnLog[],
    public readonly turnNumber: number,
  ) {}
}
