export class BetPlacedEvent {
  constructor(
    public readonly matchId: number,
    public readonly userId: number,
    public readonly heroId: number,
    public readonly amount: number,
  ) {}
}
