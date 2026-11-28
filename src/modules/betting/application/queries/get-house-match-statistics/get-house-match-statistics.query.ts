export class GetHouseMatchStatisticsQuery {
  constructor(
    public readonly heroId?: number,
    public readonly orderBy?: string,
  ) {}
}
