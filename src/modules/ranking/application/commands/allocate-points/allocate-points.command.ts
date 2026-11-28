export class AllocatePointsCommand {
  constructor(
    public readonly ownedHeroId: number,
    public readonly accountId: number,
    public readonly atkPoint: number,
    public readonly defPoint: number,
    public readonly hpPoint: number,
    public readonly spdPoint: number,
    public readonly critRatePoint: number,
  ) {}
}
