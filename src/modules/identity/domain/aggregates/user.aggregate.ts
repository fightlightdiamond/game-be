import { AggregateRoot } from '@nestjs/cqrs';
import { RoleEnum } from '../enums/role.enum';

export class User extends AggregateRoot {
  constructor(
    public readonly id: number,
    private email: string,
    private passwordHash: string,
    public readonly role: RoleEnum,
    public readonly confirmedEmail: boolean,
  ) {
    super();
  }

  static create(id: number, email: string, passwordHash: string): User {
    return new User(id, email, passwordHash, RoleEnum.USER, false);
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getEmail(): string {
    return this.email;
  }
}
