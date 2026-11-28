export class ChallengeCommand {
  constructor(
    public readonly userId: number, // challenger's user id
    public readonly competitorId: number, // competitor's UserHero id
  ) {}
}
