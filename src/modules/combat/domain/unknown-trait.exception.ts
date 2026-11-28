export class UnknownTraitException extends Error {
  constructor(heroName: string) {
    super(`Unknown trait: ${heroName}`);
    this.name = 'UnknownTraitException';
  }
}
