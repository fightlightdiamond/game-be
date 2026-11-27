export class MatchEndedEvent {
  constructor(
    public readonly matchId: number,
    public readonly winnerBets: Array<{ userId: number; payout: number }>,
  ) {}
}
