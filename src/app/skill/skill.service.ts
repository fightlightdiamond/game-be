// const VINH_CUU_STATUS = -2;
// const DISABLE_STATUS = -1;
// const ENABLE_STATUS = 0;

import * as _ from 'lodash';
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';

export class SkillService {
  static restSkill = (home, away): [IMatchLog, IMatchLog] => {
    home.is_active_skill = false;
    away.take_skill_dmg = 0;
    home.take_dmg = 0;
    away.effect_resistance = 0;
    return [_.cloneDeep(home), _.cloneDeep(away)];
  };

  static Hell(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.restSkill(home, away);
    }

    if (home.current_hp / home.hp <= 0.7 && home.current_hp < away.current_hp) {
      home.is_active_skill = true;
      home.current_atk += Math.round((away.current_hp - home.current_hp) / 10);
    }

    const ratioAwayHp = away.current_hp / away.hp;

    if (ratioAwayHp <= 0.3) {
      home.is_active_skill = true;
      away.current_hp = 0;
    }

    return [_.cloneDeep(home), _.cloneDeep(away)];
  }

  static Spinx(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.restSkill(home, away);
    }

    const ratioHp = home.current_hp / home.hp;
    if (ratioHp <= 0.5) {
      home.is_active_skill = true;
      home.intrinsic_status = 1;
      home.current_crit_rate += 20;
      home.current_atk_healing += 30;
      home.intrinsic_status = -1;
    }
    return [_.cloneDeep(home), _.cloneDeep(away)];
  }

  static Valkyrie(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.restSkill(home, away);
    }

    if (home.intrinsic_status < 5) {
      home.intrinsic_status += 1;
    }

    home.is_active_skill = true;
    const dmg = Math.round(0.02 * home.intrinsic_status * away.hp);
    away.take_skill_dmg = dmg;
    away.current_hp -= dmg;

    return [_.cloneDeep(home), _.cloneDeep(away)];
  }

  static Hera(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.restSkill(home, away);
    }

    if (away.intrinsic_status !== 0 && home.intrinsic_status == 0) {
      //Kick hoat skill
      home.is_active_skill = true;
      // Tang diem noi tai
      home.intrinsic_status = 1;
      away.current_atk = Math.round(away.current_atk * 0.75);
    }

    const ratioHp = home.current_hp / home.hp;
    if (ratioHp <= 0.7) {
      const r = Math.floor(Math.random() * 100) + 1;
      if (r <= 33) {
        // Cam skill
        home.effect_resistance = 1;
      } else {
        home.current_crit_dmg = Math.round(home.current_crit_dmg * 1.2);
        home.current_def = Math.round(home.current_def * 1.15);
      }
      home.is_active_skill = true;
    }

    return [_.cloneDeep(home), _.cloneDeep(away)];
  }

  static Darklord(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.restSkill(home, away);
    }

    const ratioHp = home.current_hp / home.hp;

    if (ratioHp <= 0.6) {
      home.is_active_skill = true;
      home.current_atk = Math.round(home.current_atk * 1.55);
      home.current_def = Math.round(home.current_def * 1.5);
      home.intrinsic_status = -1;
    }

    return [_.cloneDeep(home), _.cloneDeep(away)];
  }

  static Poseidon(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.restSkill(home, away);
    }

    if (home.intrinsic_status < 10) {
      home.is_active_skill = true;
      home.intrinsic_status += 1;
      home.current_atk = Math.round(home.current_atk * 1.07);
      home.current_def = Math.round(home.current_def * 1.02);
    }

    return [_.cloneDeep(home), _.cloneDeep(away)];
  }

  static Fenrir(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.restSkill(home, away);
    }

    home.is_active_skill = true;
    home.current_crit_rate += 5;
    home.current_crit_dmg += 15;
    home.intrinsic_status += 1;

    return [_.cloneDeep(home), _.cloneDeep(away)];
  }

  static Chiron(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.restSkill(home, away);
    }

    home.is_active_skill = true;
    home.current_atk = Math.round(
      home.atk * (1 + ((home.hp - home.current_hp) / home.hp) * 0.8),
    );

    return [_.cloneDeep(home), _.cloneDeep(away)];
  }

  static Phoenix(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.restSkill(home, away);
    }

    const ratioHp = home.current_hp / home.hp;
    if (ratioHp <= 0.5) {
      //Reset lai
      home.is_active_skill = true;
      home.current_hp += Math.round((home.hp - home.current_hp) * 0.4);
      home.current_def *= 2;
      home.current_crit_rate += 20;
      home.intrinsic_status = -1;
    }

    return [_.cloneDeep(home), _.cloneDeep(away)];
  }
}
