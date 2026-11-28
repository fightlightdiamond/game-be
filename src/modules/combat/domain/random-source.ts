/** Integers used by a blow (0 through 100) and by a trait (1 through 100). */
export interface RandomSource {
  roll(min: number, max: number): number;
}

export class MathRandomSource implements RandomSource {
  roll(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
  }
}

/** Returns the given integers in order. Tests use this so a fight is repeatable. */
export class SequenceRandomSource implements RandomSource {
  private index = 0;

  constructor(private readonly values: number[]) {}

  roll(): number {
    const value = this.values[this.index];
    this.index += 1;
    if (value === undefined) {
      throw new Error('SequenceRandomSource has no further rolls');
    }
    return value;
  }
}
