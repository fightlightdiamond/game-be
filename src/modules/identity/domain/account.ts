import { Address } from './address';
import { RoleEnum } from './enums/role.enum';

export class Account {
  constructor(
    readonly id: number,
    private readonly email: string,
    private readonly passwordHash: string,
    readonly role: RoleEnum,
    readonly confirmedEmail: boolean,
    readonly address: Address | null,
  ) {}

  static register(email: string, passwordHash: string): Account {
    return new Account(0, email, passwordHash, RoleEnum.USER, false, null);
  }

  getEmail(): string {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }
}
