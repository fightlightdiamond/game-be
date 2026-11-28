export class LevelUpUserHeroCommand {
  constructor(
    public readonly userHeroId: number,
    public readonly userId: number,
  ) {}
}
