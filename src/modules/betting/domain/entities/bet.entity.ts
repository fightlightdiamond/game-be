export class Bet {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly matchId: number,
    public readonly heroId: number,
    public readonly balance: number,
    public result: boolean = false,
  ) {}
}
