export class ChallengeCommand {
  constructor(
    public readonly accountId: number, // challenger's user id
    public readonly competitorId: number,
  ) {}
}
