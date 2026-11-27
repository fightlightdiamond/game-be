export class MatchCreatedEvent {
  constructor(
    public readonly matchId: number,
    public readonly heroInfo: Array<Record<string, unknown>>,
    public readonly startTime: string,
    public readonly status: number,
  ) {}
}
