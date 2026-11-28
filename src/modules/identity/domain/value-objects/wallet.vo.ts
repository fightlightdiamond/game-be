import { InsufficientFundsException } from '../exceptions/insufficient-funds.exception';

export class Wallet {
  constructor(private readonly balance: number) {}

  deduct(amount: number): Wallet {
    if (amount > this.balance) {
      throw new InsufficientFundsException(amount, this.balance);
    }
    return new Wallet(this.balance - amount);
  }

  credit(amount: number): Wallet {
    return new Wallet(this.balance + amount);
  }

  getBalance(): number {
    return this.balance;
  }
}
