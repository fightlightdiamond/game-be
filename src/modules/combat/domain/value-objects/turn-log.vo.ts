/**
 * Immutable record of a single combat turn.
 * No NestJS decorators — pure TypeScript.
 */
export class TurnLog {
  constructor(
    public readonly turnNumber: number,
    public readonly attackerId: number,
    public readonly defenderId: number,
    public readonly damage: number,
    public readonly skillDamage: number,
    public readonly attackerHpAfter: number,
    public readonly defenderHpAfter: number,
    public readonly isCrit: boolean,
    public readonly isActiveSkill: boolean,
  ) {}
}
