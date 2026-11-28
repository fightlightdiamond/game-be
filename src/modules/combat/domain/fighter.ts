/**
 * Stats frozen when a fight starts. simulate copies these values.
 * Callers do not change the instance they pass in.
 */
export class Fighter {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly maxHp: number,
    readonly currentHp: number,
    readonly baseAtk: number,
    readonly currentAtk: number,
    readonly baseDef: number,
    readonly currentDef: number,
    readonly spd: number,
    readonly critRate: number,
    readonly critDmg: number,
    readonly dodge: number,
    readonly effectResistance: number,
    readonly intrinsicStatus: number,
  ) {}

  copy(patch: FighterPatch): Fighter {
    return new Fighter(
      this.id,
      this.name,
      this.maxHp,
      patch.currentHp ?? this.currentHp,
      patch.baseAtk ?? this.baseAtk,
      patch.currentAtk ?? this.currentAtk,
      patch.baseDef ?? this.baseDef,
      patch.currentDef ?? this.currentDef,
      this.spd,
      patch.critRate ?? this.critRate,
      patch.critDmg ?? this.critDmg,
      this.dodge,
      patch.effectResistance ?? this.effectResistance,
      patch.intrinsicStatus ?? this.intrinsicStatus,
    );
  }
}

export type FighterPatch = Partial<
  Pick<
    Fighter,
    | 'baseAtk'
    | 'baseDef'
    | 'critDmg'
    | 'critRate'
    | 'currentAtk'
    | 'currentDef'
    | 'currentHp'
    | 'effectResistance'
    | 'intrinsicStatus'
  >
>;
