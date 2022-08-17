import { IHero } from '../../migrations/interfaces/hero.interface';

export const stats = {
  hp: 10000,
  atk: 1000,
  def: 200,
  spd: 100,
  crit_rate: 20,
  crit_dmg: 180,
  // L1
  atk_healing: 15,
  take_dmg_healing: 10,
  dodge: 10,
  acc: 100,
};

export function hpRandom() {
  return Math.floor((Math.random() * stats.hp) / 10) + stats.hp;
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

export const heroesName = [
  'Fenrir',
  'Phoenix',
  'Hell',
  'Darklord',
  'Valkyrie',
  'Poseidon',
  'Hera',
  'Chiron',
];

export function getRandomHeroName() {
  return heroesName[Math.floor(Math.random() * heroesName.length)];
}

export class Hero implements IHero {
  atk: number;
  def: number;
  hp: number;
  name: string;
  spd: number;
  crit_rate?: number;
  crit_dmg?: number;
  status?: number;
  intrinsic_status: number;
  effect_resistance: number;
  dodge: number;
  acc: number;
  cc: number;

  constructor() {
    this.atk = atkRandom();
    this.def = defRandom();
    this.hp = hpRandom();
    this.spd = spdRandom();
    this.name = getRandomHeroName();
    this.crit_dmg = critDmgRandom();
    this.crit_rate = critRateRandom();
    this.intrinsic_status = 0;
    this.effect_resistance = 0;
  }

  // attack(away: IHero): IHero[] {
  //   const [home2, away2]: IHero[] = TurnService.turn(this, away);
  //   // this = home2;
  //   away = away2;
  //   if (away2.current_hp < 0) {
  //     console.log(this.name, 'WIN');
  //     return [home2, away2];
  //   }
  //   // 2
  //   const [away3, home3] = TurnService.turn(away2, home2);
  //   // this = home3;
  //   away = away3;
  //   if (home3.current_hp < 0) {
  //     console.log(away.name, 'WIN');
  //   }
  //   return [home3, away3];
  // }
}
