export class PlaceStakeCommand {
  constructor(
    readonly accountId: number,
    readonly matchId: number,
    readonly heroId: number,
    readonly amount: number,
  ) {}
}
