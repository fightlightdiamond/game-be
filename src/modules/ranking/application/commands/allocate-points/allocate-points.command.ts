export class AllocatePointsCommand {
  constructor(
    public readonly userHeroId: number,
    public readonly userId: number,
    public readonly atkPoint: number,
    public readonly defPoint: number,
    public readonly hpPoint: number,
    public readonly spdPoint: number,
    public readonly critRatePoint: number,
  ) {}
}
