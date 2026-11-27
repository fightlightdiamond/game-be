export class BettingClosedException extends Error {
  constructor() {
    super('Betting is closed for this match');
    this.name = 'BettingClosedException';
  }
}
