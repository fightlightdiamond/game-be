// const VINH_CUU_STATUS = -2;
// const DISABLE_STATUS = -1;
// const ENABLE_STATUS = 0;

import { IMatchLog } from '../../migrations/interfaces/match-log.interface';

export class SkillService {
  static Hell(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      //Reset lai
      home.is_active_skill = false;
      away.take_skill_dmg = 0;
      home.take_skill_dmg = 0;
      return [home, away];
    }
    const ratioAwayHp = away.current_hp / away.hp;

    // if (home.hp <= 0.5) {
    //   home.is_active_skill = true;
    //   away.current_hp *= 0.7;
    // }

    if (
      ratioAwayHp <= 0.3 ||
      (home.current_hp / home.hp <= 0.01 && ratioAwayHp <= 0.4)
    ) {
      console.log(
        'Hell A',
        home.name,
        home.current_hp,
        away.name,
        away.current_hp,
      );
      home.is_active_skill = true;

      away.status = 0;
      away.current_hp = 0;
    }

    if (home.current_hp / home.hp <= 0.6) {
      away.current_def = 0;
    }

    return [home, away];
  }

  static Spinx(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      //Reset lai
      home.is_active_skill = false;
      away.take_skill_dmg = 0;
      home.take_skill_dmg = 0;
      away.effect_resistance = 0;
      return [home, away];
    }
    const ratioHp = home.current_hp / home.hp;
    if (ratioHp <= 0.5) {
      home.is_active_skill = true;
      home.intrinsic_status = 1;
      home.current_crit_rate += 20;
      home.current_atk_healing += 30;
      home.intrinsic_status = -1;
    }
    return [home, away];
  }

  static Valkyrie(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      //Reset lai
      home.is_active_skill = false;
      away.take_skill_dmg = 0;
      home.take_skill_dmg = 0;
      away.effect_resistance = 0;
      return [home, away];
    }
    if (home.intrinsic_status < 5) {
      home.current_def *= 1.15;
      home.is_active_skill = true;
      home.intrinsic_status += 1;
    } else {
      home.intrinsic_status = -1;
    }
    const dmg = 0.02 * home.intrinsic_status * away.hp;
    away.take_skill_dmg = dmg;
    away.current_hp -= dmg;

    return [home, away];
  }

  static Hera(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      //Reset lai
      home.is_active_skill = false;
      away.take_skill_dmg = 0;
      home.take_skill_dmg = 0;
      //Set lại effect tắt skill
      away.effect_resistance = 0;
      return [home, away];
    }

    if (away.intrinsic_status !== 0 && home.intrinsic_status == 0) {
      //Kick hoat skill
      home.is_active_skill = true;
      // Tang diem noi tai
      home.intrinsic_status = 1;
      away.current_atk *= 0.75;
    }

    const ratioHp = home.current_hp / home.hp;
    if (ratioHp <= 0.7) {
      const r = Math.floor(Math.random() * 100) + 1;
      if (r <= 33) {
        // Cam skill
        home.effect_resistance = 1;
        console.log(
          '-----------------Hera A-------------------',
          home.name,
          home.current_hp,
          // ratioHp,
          home.hp,
          away.name,
        );
      } else {
        home.current_crit_dmg *= 1.1;
        home.current_def *= 1.15;
      }
      home.is_active_skill = true;
    }

    return [home, away];
  }

  static Darklord(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      //Reset lai
      home.is_active_skill = false;
      away.take_skill_dmg = 0;
      home.take_skill_dmg = 0;
      away.effect_resistance = 0;
      return [home, away];
    }

    const ratioHp = home.current_hp / home.hp;
    if (ratioHp <= 0.6) {
      home.is_active_skill = true;
      home.current_atk *= 1.55;
      home.current_def *= 1.5;
      home.intrinsic_status = -1;
      console.log(
        '-----------------Darklord A-------------------',
        home.name,
        home.current_hp,
        ratioHp,
        home.hp,
        away.name,
      );
    }

    return [home, away];
  }

  static Poseidon(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      //Reset lai
      home.is_active_skill = false;
      away.take_skill_dmg = 0;
      home.take_skill_dmg = 0;
      away.effect_resistance = 0;
      return [home, away];
    }

    if (home.intrinsic_status < 10) {
      //Reset lai
      home.is_active_skill = true;
      home.intrinsic_status += 1;
      home.current_atk *= 1.07;
      home.current_def *= 1.02;
    }
    // else {
    //   // home.intrinsic_status = -1;
    // }

    return [home, away];
  }

  static Fenrir(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    /**
     * 1. Cam hieu ung, 2. Hieu sai het
     */
    if (away.effect_resistance || home.intrinsic_status === -1) {
      console.log(
        '---------------Fenrir D---------------------',
        away.effect_resistance,
        home.intrinsic_status,
      );
      //Reset lai
      home.is_active_skill = false;
      away.take_skill_dmg = 0;
      home.take_skill_dmg = 0;
      away.effect_resistance = 0;
      return [home, away];
    }
    //Reset lai
    home.is_active_skill = true;
    home.current_crit_rate += 5;
    home.current_crit_dmg += 15;
    // home.current_def += 1.07;
    console.log(
      '-----------------Fenrir A-------------------',
      home.name,
      away.name,
    );

    home.intrinsic_status += 1;

    return [home, away];
  }

  static Chiron(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance) {
      //Reset lai
      home.is_active_skill = false;
      away.take_skill_dmg = 0;
      home.take_skill_dmg = 0;
      away.effect_resistance = 0;
      return [home, away];
    }

    // const ratioHp = home.current_hp / home.hp;
    // if (ratioHp <= 0.6) {
    //Reset lai
    home.is_active_skill = true;
    // const r = Math.floor(Math.random() * 100) + 1;
    // if (r <= 25) {
    //   home.effect_resistance = 1;
    // }
    home.current_atk *= 1.035;
    home.current_hp += 0.05 * (home.hp - home.current_hp);
    home.current_def *= 1.03;
    home.intrinsic_status += 1;
    // }
    return [home, away];
  }

  static Phoenix(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      //Reset lai
      home.is_active_skill = false;
      away.take_skill_dmg = 0;
      home.take_skill_dmg = 0;
      away.effect_resistance = 0;
      console.log(
        '--------------- D---------------------',
        away.effect_resistance,
        home.intrinsic_status,
      );
      return [home, away];
    }

    const ratioHp = home.current_hp / home.hp;
    if (ratioHp <= 0.5) {
      //Reset lai
      home.is_active_skill = true;
      // if (away.intrinsic_status > 3) {
      //   home.current_hp = home.hp * away.intrinsic_status * 0.16;
      // } else {
      //
      // }
      home.current_hp += (home.hp - home.current_hp) * 0.6;

      home.current_def *= 2;
      // home.current_spd *= 1.1;
      // home.effect_resistance = 1;
      home.intrinsic_status = -1;

      console.log(
        '----------------- A-------------------',
        home.name,
        home.current_hp,
        ratioHp,
        home.hp,
        away.name,
      );
    }

    return [home, away];
  }
}
