export class StakePlaced {
  constructor(
    readonly matchId: number,
    readonly accountId: number,
    readonly heroId: number,
    readonly amount: number,
  ) {}
}
