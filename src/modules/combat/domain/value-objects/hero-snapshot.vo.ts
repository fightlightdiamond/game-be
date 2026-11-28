/**
 * Immutable snapshot of a hero's combat stats at the moment a simulation begins.
 * No NestJS decorators — pure TypeScript.
 */
export class HeroSnapshot {
  constructor(
    public readonly id: number,
    public readonly name: string,
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

  withHp(hp: number): HeroSnapshot {
    return new HeroSnapshot(
      this.id,
      this.name,
      hp,
      this.atk,
      this.def,
      this.spd,
      this.critRate,
      this.critDmg,
      this.atkHealing,
      this.takeDmgHealing,
      this.dodge,
      this.acc,
      this.cc,
      this.effectResistance,
      this.intrinsicStatus,
    );
  }

  withAtk(atk: number): HeroSnapshot {
    return new HeroSnapshot(
      this.id,
      this.name,
      this.hp,
      atk,
      this.def,
      this.spd,
      this.critRate,
      this.critDmg,
      this.atkHealing,
      this.takeDmgHealing,
      this.dodge,
      this.acc,
      this.cc,
      this.effectResistance,
      this.intrinsicStatus,
    );
  }

  withDef(def: number): HeroSnapshot {
    return new HeroSnapshot(
      this.id,
      this.name,
      this.hp,
      this.atk,
      def,
      this.spd,
      this.critRate,
      this.critDmg,
      this.atkHealing,
      this.takeDmgHealing,
      this.dodge,
      this.acc,
      this.cc,
      this.effectResistance,
      this.intrinsicStatus,
    );
  }

  withSpd(spd: number): HeroSnapshot {
    return new HeroSnapshot(
      this.id,
      this.name,
      this.hp,
      this.atk,
      this.def,
      spd,
      this.critRate,
      this.critDmg,
      this.atkHealing,
      this.takeDmgHealing,
      this.dodge,
      this.acc,
      this.cc,
      this.effectResistance,
      this.intrinsicStatus,
    );
  }

  withCritRate(critRate: number): HeroSnapshot {
    return new HeroSnapshot(
      this.id,
      this.name,
      this.hp,
      this.atk,
      this.def,
      this.spd,
      critRate,
      this.critDmg,
      this.atkHealing,
      this.takeDmgHealing,
      this.dodge,
      this.acc,
      this.cc,
      this.effectResistance,
      this.intrinsicStatus,
    );
  }

  withCritDmg(critDmg: number): HeroSnapshot {
    return new HeroSnapshot(
      this.id,
      this.name,
      this.hp,
      this.atk,
      this.def,
      this.spd,
      this.critRate,
      critDmg,
      this.atkHealing,
      this.takeDmgHealing,
      this.dodge,
      this.acc,
      this.cc,
      this.effectResistance,
      this.intrinsicStatus,
    );
  }

  withEffectResistance(effectResistance: number): HeroSnapshot {
    return new HeroSnapshot(
      this.id,
      this.name,
      this.hp,
      this.atk,
      this.def,
      this.spd,
      this.critRate,
      this.critDmg,
      this.atkHealing,
      this.takeDmgHealing,
      this.dodge,
      this.acc,
      this.cc,
      effectResistance,
      this.intrinsicStatus,
    );
  }

  withIntrinsicStatus(intrinsicStatus: number): HeroSnapshot {
    return new HeroSnapshot(
      this.id,
      this.name,
      this.hp,
      this.atk,
      this.def,
      this.spd,
      this.critRate,
      this.critDmg,
      this.atkHealing,
      this.takeDmgHealing,
      this.dodge,
      this.acc,
      this.cc,
      this.effectResistance,
      intrinsicStatus,
    );
  }
}
