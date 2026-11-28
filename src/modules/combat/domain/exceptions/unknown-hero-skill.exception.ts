export class UnknownHeroSkillException extends Error {
  constructor(heroName: string) {
    super(`Unknown hero skill: ${heroName}`);
    this.name = 'UnknownHeroSkillException';
  }
}
