import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Account } from '../../../domain/account';
import {
  ACCOUNT_REPOSITORY,
  AccountRepository,
} from '../../../domain/repositories/account.repository';
import { GetAccountByEmailQuery } from './get-account-by-email.query';

@QueryHandler(GetAccountByEmailQuery)
export class GetAccountByEmailHandler
  implements IQueryHandler<GetAccountByEmailQuery, Account | null>
{
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accounts: AccountRepository,
  ) {}

  async execute(query: GetAccountByEmailQuery): Promise<Account | null> {
    return this.accounts.findByEmail(query.email);
  }
}
