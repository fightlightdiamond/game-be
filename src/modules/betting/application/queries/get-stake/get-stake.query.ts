export class GetStakeQuery {
  constructor(
    public readonly accountId: number,
    public readonly matchId: number,
  ) {}
}
