export class BetAmount {
  constructor(private readonly value: number) {
    if (value <= 0) {
      throw new Error('Bet amount must be positive');
    }
  }

  getValue(): number {
    return this.value;
  }
}
