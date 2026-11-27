export class PlaceBetCommand {
  constructor(
    public readonly userId: number,
    public readonly matchId: number,
    public readonly heroId: number,
    public readonly amount: number,
  ) {}
}
