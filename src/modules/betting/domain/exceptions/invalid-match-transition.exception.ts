export class InvalidMatchTransitionException extends Error {
  constructor(currentStatus: number, attemptedStatus: number) {
    super(
      `Invalid match transition from status ${currentStatus} to ${attemptedStatus}`,
    );
    this.name = 'InvalidMatchTransitionException';
  }
}
