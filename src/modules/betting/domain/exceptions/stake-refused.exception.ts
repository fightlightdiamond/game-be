export class StakeRefusedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StakeRefusedException';
  }
}

export class HouseMatchNotFoundException extends Error {
  constructor(matchId: number) {
    super(`House match ${matchId} not found`);
    this.name = 'HouseMatchNotFoundException';
  }
}
