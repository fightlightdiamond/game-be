import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Account } from '../../../domain/account';
import {
  ACCOUNT_REPOSITORY,
  AccountRepository,
} from '../../../domain/repositories/account.repository';
import { GetAccountQuery } from './get-account.query';

@QueryHandler(GetAccountQuery)
export class GetAccountHandler
  implements IQueryHandler<GetAccountQuery, Account | null>
{
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accounts: AccountRepository,
  ) {}

  async execute(query: GetAccountQuery): Promise<Account | null> {
    return this.accounts.findById(query.accountId);
  }
}
