import { IHero } from './hero.interface';

export interface IMatchLog {
  id: number;
  u_id: string;
  name: string;
  effect_resistance: number;
  intrinsic_status: number;
  atk: number;
  hp: number;
  def: number;
  status: number;

  is_crit: boolean;
  is_active_skill: boolean;
  take_skill_dmg: number;
  take_dmg: number;
  turn_number: number;

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
  is_atk?: boolean;

  attack(away: IMatchLog): IMatchLog[];
  setHome(home: IHero): IMatchLog;
  setCurrent(): IMatchLog;
}
