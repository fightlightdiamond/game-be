import { TurnService } from '../turn/turn.service';
import { Hero, IHero } from './interfaces/hero.interface';

export interface IHeroLog extends IHero {
  // atk: number;
  // def: number;
  // hp: number;
  // spd: number;
  // crit_rate: number;
  // crit_dmg: number;
  // atk_healing: number;
  // take_dmg_healing: number;
  // status: number;
  // intrinsic_status: number;
  // effect_resistance: number;
  is_crit: boolean;
  is_active_skill: boolean;
  take_skill_dmg: number;
  take_dmg: number;

  attack(away: IHeroLog): IHeroLog[];
  setHome(home: IHero): IHeroLog;
}

export class HeroLog extends Hero implements IHeroLog {
  atk: number;
  def: number;
  crit_rate: number;
  crit_dmg: number;
  effect_resistance: number;
  hp: number;
  intrinsic_status: number;
  name: string;
  spd: number;
  atk_healing: number;
  is_active_skill: boolean;
  is_crit: boolean;
  take_dmg: number;
  take_dmg_healing: number;
  take_skill_dmg: number;
  status: number;

  attack(away: IHeroLog): IHeroLog[] {
    // Turn 1
    const [home2, away2]: IHeroLog[] = TurnService.turn(this, away);
    if (away2.current_hp < 0) {
      console.log(this.name, 'WIN');
      return [home2, away2];
    }
    // Turn 2
    const [away3, home3] = TurnService.turn(away2, home2);
    if (home3.current_hp < 0) {
      console.log(away.name, 'WIN');
      return [home3, away3];
    }
    return [home2, away2, home3, away3];
  }

  setHome(home: IHero): IHeroLog {
    for (const [key, value] of Object.entries(home)) {
      this[key] = value;
    }
    return this;
  }
}
