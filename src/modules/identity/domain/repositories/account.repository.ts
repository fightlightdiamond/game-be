import { Account } from '../account';

export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY');

export interface AccountRepository {
  findById(id: number): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  save(account: Account): Promise<Account>;
}
