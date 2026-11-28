import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Account } from '../../../domain/account';
import {
  ACCOUNT_REPOSITORY,
  AccountRepository,
} from '../../../domain/repositories/account.repository';
import { PasswordHasher } from '../../../infrastructure/auth/password-hasher';
import { RegisterAccountCommand } from './register-account.command';

@CommandHandler(RegisterAccountCommand)
export class RegisterAccountHandler
  implements ICommandHandler<RegisterAccountCommand>
{
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accounts: AccountRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: RegisterAccountCommand): Promise<Account> {
    const passwordHash = await this.passwordHasher.hash(command.password);
    return this.accounts.save(Account.register(command.email, passwordHash));
  }
}
