export class Challenge {
  constructor(
    readonly id: number,
    readonly heroInfo: Array<Record<string, unknown>>,
    readonly turns: Array<Record<string, unknown>>,
    readonly startTime: string,
    readonly turnNumber: number,
    readonly status: number,
    readonly winner: number,
    readonly loser: number,
    readonly accountId: number,
  ) {}

  static create(
    heroInfo: Array<Record<string, unknown>>,
    turns: Array<Record<string, unknown>>,
    turnNumber: number,
    winner: number,
    loser: number,
    accountId: number,
  ): Challenge {
    return new Challenge(
      0,
      heroInfo,
      turns,
      Date.now().toString(),
      turnNumber,
      3,
      winner,
      loser,
      accountId,
    );
  }
}
