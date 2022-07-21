export interface IHero {
  name: string;
  //Base stats
  hp: number;
  atk: number;
  def: number;
  spd: number;
  // action
  attack: (targetEntity: IHero, skill) => void;
  // Special stats
  crit_rate?: number;
  crit_dmg?: number;
  // L1
  atk_healing?: number;
  take_dmg_healing?: number;
  // L2
  dodge?: number;
  acc?: number;
  // L3
  cc?: number;
  effect_resistance?: string;
  status?: string;
  element?: string;
  position?: string;
}

export interface ISkill {
  name: string;
  countdown: number;
  position: string;
  status: string;
  NumberOfUses: number;
}

export const stats = {
  HP: 8000,
  atk: 1200,
  def: 300,
  spd: 100,
  crit_rate: 20,
  crit_dmg: 180,
  // L1
  atk_healing: 15,
  take_dmg_healing: 10,
  dodge: 10,
  acc: 100,
};

export function HPRandom() {
  return Math.floor((Math.random() * stats.HP) / 10) + stats.HP;
}

export function atkRandom() {
  return Math.floor((Math.random() * stats.atk) / 10) + stats.atk;
}

export function defRandom() {
  return Math.floor((Math.random() * stats.def) / 10) + stats.def;
}

export function spdRandom() {
  return Math.floor((Math.random() * stats.spd) / 10) + stats.def;
}

export function critDmgRandom() {
  return Math.floor((Math.random() * stats.crit_dmg) / 10) + stats.crit_dmg;
}

export function critRateRandom() {
  return Math.floor((Math.random() * stats.crit_rate) / 2) + 10;
}

export function probability() {
  return Math.floor(Math.random() * 101);
}

export class Hero implements IHero {
  atk: number;
  def: number;
  hp: number;
  name: string;
  spd: number;
  crit_rate?: number;
  crit_dmg?: number;
  constructor() {
    this.atk = atkRandom();
    this.def = defRandom();
    this.hp = HPRandom();
    this.spd = spdRandom();
    this.name = (Math.random() + 1).toString(36).substring(7);
    this.crit_dmg = critDmgRandom();
    this.crit_rate = critRateRandom();
  }

  attack(targetEntity: IHero, skill): void {
    console.log({ skill });
  }

  info() {
    return JSON.parse(JSON.stringify(this));
  }
}

export class War {
  a: IHero;
  b: IHero;
  round = 1;
  constructor(a: IHero, b: IHero) {
    this.a = a;
    this.b = b;
  }

  async timeoutPromise() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('time out');
      }, 20000);
    });
  }

  info() {
    console.log(this.a);
    console.log(this.b);
    console.log('Who Win?');
  }

  async execute() {
    this.info();
    await this.timeoutPromise();

    while (this.a.hp > 0 && this.b.hp > 0) {
      if (this.a.spd > this.b.spd) {
        this.atk(this.b, this.a);
      } else {
        this.atk(this.a, this.b);
      }
    }
    console.log('End War');
  }

  atk(a: IHero, b: IHero) {
    console.log('Round: ------------> ', this.round++);
    // First atk
    const aProbability = probability();
    if (aProbability > a.crit_rate) {
      a.hp -= b.atk - a.def;
    } else {
      console.log('Crit', b.name);
      a.hp -= Math.floor((b.atk * b.crit_dmg) / 100) - a.def;
    }

    console.log(a.name, a.hp);
    if (a.hp < 0) {
      this.a = a;
      this.b = b;
      console.log(this.b.name, 'WIN');
      return;
    }
    // Second atk
    const bProbability = probability();
    if (bProbability > b.crit_rate) {
      b.hp -= a.atk - b.def;
    } else {
      console.log('Crit', a.name);
      b.hp -= Math.floor((a.atk * a.crit_dmg) / 100) - b.def;
    }

    console.log(b.name, b.hp);
    this.a = a;
    this.b = b;
    if (b.hp < 0) {
      this.a = a;
      this.b = b;
      console.log(this.a.name, 'WIN');
    }
  }
}
