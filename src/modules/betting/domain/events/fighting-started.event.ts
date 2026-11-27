export class FightingStartedEvent {
  constructor(
    public readonly matchId: number,
    public readonly status: number,
  ) {}
}
