export class EloMatch {
  constructor(
    public readonly id: number,
    public readonly heroInfo: Array<Record<string, unknown>>,
    public readonly turns: Array<Record<string, unknown>>,
    public readonly startTime: string,
    public readonly turnNumber: number,
    public readonly status: number,
    public readonly winner: number,
    public readonly loser: number,
    public readonly userId: number, // the challenger's user id
  ) {}

  static create(
    heroInfo: Array<Record<string, unknown>>,
    turns: Array<Record<string, unknown>>,
    turnNumber: number,
    winner: number,
    loser: number,
    userId: number,
  ): EloMatch {
    return new EloMatch(
      0,
      heroInfo,
      turns,
      Date.now().toString(),
      turnNumber,
      3, // END status
      winner,
      loser,
      userId,
    );
  }
}
