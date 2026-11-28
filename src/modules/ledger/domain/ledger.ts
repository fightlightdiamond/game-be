export const LEDGER = Symbol('LEDGER');

export type AccountId = number;

/** Money of one account. Callers pass the amount. This port does not know why. */
export interface Ledger {
  debit(accountId: AccountId, amount: number): Promise<void>;
  credit(accountId: AccountId, amount: number): Promise<void>;
}
