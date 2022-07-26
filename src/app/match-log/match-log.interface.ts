import { IHero } from '../hero/interfaces/hero.interface';

export type TMatchLogInterface = TTurnLog[];

export interface IHeroLog extends IHero {
  atk: number;
  def: number;
  hp: number;
  spd: number;
  crit_rate?: number;
  crit_dmg?: number;
  atk_healing?: number;
  take_dmg_healing?: number;
  status?: number;
  intrinsic_status: number;
  effect_resistance: number;
  is_crit?: boolean;
  is_active_skill?: boolean;
  take_skill_dmg?: number;
  take_dmg?: number;
}

export type TTurnLog = [IHeroLog, IHeroLog];
