export class ExceedsLevelCapException extends Error {
  constructor(requested: number, maxAllowed: number) {
    super(
      `Skill point allocation exceeds level cap: requested ${requested}, maximum allowed ${maxAllowed}`,
    );
    this.name = 'ExceedsLevelCapException';
  }
}
