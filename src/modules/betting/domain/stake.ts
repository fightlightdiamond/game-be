export class Stake {
  constructor(
    readonly id: number,
    readonly accountId: number,
    readonly matchId: number,
    readonly heroId: number,
    readonly amount: number,
  ) {}
}
