export class SecondClaimRefusedException extends Error {
  constructor(accountId: number) {
    super(`Account ${accountId} already has an owned hero`);
    this.name = 'SecondClaimRefusedException';
  }
}
