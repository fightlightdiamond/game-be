export class LevelUpOwnedHeroCommand {
  constructor(
    public readonly ownedHeroId: number,
    public readonly accountId: number,
  ) {}
}
