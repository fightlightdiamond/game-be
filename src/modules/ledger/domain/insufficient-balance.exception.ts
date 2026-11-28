export class InsufficientBalanceException extends Error {
  constructor(accountId: number, amount: number) {
    super(`Insufficient balance for account ${accountId}: ${amount}`);
    this.name = 'InsufficientBalanceException';
  }
}

export class MissingBalanceException extends Error {
  constructor(accountId: number) {
    super(`No balance for account ${accountId}`);
    this.name = 'MissingBalanceException';
  }
}
