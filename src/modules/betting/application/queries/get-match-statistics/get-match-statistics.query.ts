export class GetMatchStatisticsQuery {
  constructor(
    public readonly heroId?: number,
    public readonly orderBy?: string,
  ) {}
}
