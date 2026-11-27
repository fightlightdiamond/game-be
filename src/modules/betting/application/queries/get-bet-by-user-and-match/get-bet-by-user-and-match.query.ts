export class GetBetByUserAndMatchQuery {
  constructor(
    public readonly userId: number,
    public readonly matchId: number,
  ) {}
}
