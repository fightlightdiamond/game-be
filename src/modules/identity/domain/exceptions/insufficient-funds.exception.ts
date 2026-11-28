export class InsufficientFundsException extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient funds: required ${required}, available ${available}`);
    this.name = 'InsufficientFundsException';
  }
}
