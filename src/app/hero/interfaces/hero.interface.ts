import { Turn } from '../../war/turn';

export interface IHero {
  name: string;
  //Base stats
  hp: number;
  atk: number;
  def: number;
  spd: number;
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
  //Base stats
  current_hp?: number;
  current_atk?: number;
  current_def?: number;
  current_spd?: number;
  // Special stats
  current_crit_rate?: number;
  current_crit_dmg?: number;
  // L1
  current_atk_healing?: number;
  current_take_dmg_healing?: number;
  // L2
  current_dodge?: number;
  current_acc?: number;
  // L3
  current_cc?: number;
  intrinsic_status?: number;
  // action
  attack: (targetEntity: IHero) => IHero[];
  // intrinsic_skill: (targetEntity: IHero) => void;
  effect_resistance?: number;
  status?: number;
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
  HP: 10000,
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
const herosName = [
  'Fenrir',
  'Jormungandr',
  'Hell',
  'Darklord',
  'Valkyrie',
  'Poseidon',
  'Hera',
  'Chiron',
];

export function getRandomHeroName() {
  return herosName[Math.floor(Math.random() * herosName.length)];
}

export class Hero implements IHero {
  atk: number;
  def: number;
  hp: number;
  name: string;
  spd: number;
  crit_rate?: number;
  crit_dmg?: number;
  current_atk: number;
  current_def: number;
  current_hp: number;
  current_spd: number;
  current_crit_rate?: number;
  current_crit_dmg?: number;
  current_atk_healing?: number;
  current_take_dmg_healing?: number;
  status?: number;
  intrinsic_status: number;
  effect_resistance: number;
  constructor() {
    this.atk = atkRandom();
    this.current_atk = this.atk;
    this.def = defRandom();
    this.current_def = this.def;
    this.hp = HPRandom();
    this.current_hp = this.hp;
    this.spd = spdRandom();
    this.current_spd = this.spd;
    this.name = getRandomHeroName();
    this.crit_dmg = critDmgRandom();
    this.current_crit_dmg = this.crit_dmg;
    this.crit_rate = critRateRandom();
    this.current_crit_rate = this.crit_rate;
    this.intrinsic_status = 0;
    this.effect_resistance = 0;
  }

  attack(away: IHero): IHero[] {
    const [home2, away2]: IHero[] = Turn.turn(this, away);
    // this = home2;
    away = away2;
    if (away2.current_hp < 0) {
      console.log(this.name, 'WIN');
      return [home2, away2];
    }
    // 2
    const [away3, home3] = Turn.turn(away2, home2);
    // this = home3;
    away = away3;
    if (home3.current_hp < 0) {
      console.log(away.name, 'WIN');
    }
    return [home3, away3];
  }

  setHome(home: IHero) {
    for (const [key, value] of Object.entries(home)) {
      this[key] = value();
    }
  }
}
