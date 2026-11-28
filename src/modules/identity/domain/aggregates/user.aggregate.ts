import { AggregateRoot } from '@nestjs/cqrs';
import { Wallet } from '../value-objects/wallet.vo';
import { RoleEnum } from '../enums/role.enum';

export class User extends AggregateRoot {
  constructor(
    public readonly id: number,
    private email: string,
    private passwordHash: string,
    public readonly role: RoleEnum,
    public readonly confirmedEmail: boolean,
    private wallet: Wallet,
  ) {
    super();
  }

  static create(id: number, email: string, passwordHash: string): User {
    return new User(
      id,
      email,
      passwordHash,
      RoleEnum.USER,
      false,
      new Wallet(0),
    );
  }

  deductBalance(amount: number): void {
    this.wallet = this.wallet.deduct(amount);
  }

  creditBalance(amount: number): void {
    this.wallet = this.wallet.credit(amount);
  }

  getBalance(): number {
    return this.wallet.getBalance();
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getEmail(): string {
    return this.email;
  }
}
