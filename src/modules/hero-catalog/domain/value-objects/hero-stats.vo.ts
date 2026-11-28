export class HeroStats {
  constructor(
    public readonly hp: number,
    public readonly atk: number,
    public readonly def: number,
    public readonly spd: number,
    public readonly critRate: number,
    public readonly critDmg: number,
    public readonly atkHealing: number,
    public readonly takeDmgHealing: number,
    public readonly dodge: number,
    public readonly acc: number,
    public readonly cc: number,
    public readonly effectResistance: number,
    public readonly intrinsicStatus: number,
  ) {}
}
