import * as _ from 'lodash';
import { TurnService } from '../turn/turn.service';
import { IHero } from '../../migrations/interfaces/hero.interface';
import { Hero } from '../../common/utils/hero.util';
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';

export class HeroLog extends Hero implements IMatchLog {
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
  round: number;

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

  setCurrent() {
    this.current_hp = this.hp;
    this.current_atk = this.atk;
    this.current_def = this.def;
    this.current_spd = this.spd;
    this.current_crit_rate = this.crit_rate;
    this.current_crit_dmg = this.crit_dmg;
    this.current_atk_healing = this.atk_healing;
    this.current_take_dmg_healing = this.take_dmg_healing;
    this.current_dodge = this.dodge;
    this.current_acc = this.acc;
    this.current_cc = this.cc;

    return this;
  }

  attack(away: IMatchLog): IMatchLog[] {
    // Turn 1
    const [home2, away2]: IMatchLog[] = TurnService.turn(
      _.cloneDeep(this),
      _.cloneDeep(away),
    );

    if (away2.current_hp < 0) {
      console.log(this.name, 'WIN');

      return [home2, away2];
    }
    // Turn 2
    const [away3, home3] = TurnService.turn(
      _.cloneDeep(away2),
      _.cloneDeep(home2),
    );

    if (home3.current_hp < 0) {
      console.log(away.name, 'WIN');

      return [home3, away3];
    }

    return [home2, away2, home3, away3];
  }

  setHome(home: IHero): IMatchLog {
    for (const [key, value] of Object.entries(home)) {
      this[key] = value;
    }

    return this;
  }
}
