// const VINH_CUU_STATUS = -2;
// const DISABLE_STATUS = -1;
// const ENABLE_STATUS = 0;

import { IHeroLog } from '../hero/hero.log';

export class SkillService {
  static Hell(home: IHeroLog, away: IHeroLog): [IHeroLog, IHeroLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return [home, away];
    }
    const ratioHp = away.current_hp / away.hp;
    if (
      ratioHp <= 0.3 ||
      (home.current_hp / home.hp <= 0.5 && ratioHp <= 0.35)
    ) {
      console.log(
        '-----------------Hell A-------------------',
        home.name,
        home.current_hp,
        away.name,
        away.current_hp,
      );
      away.status = 0;
      away.current_hp = 0;
    }
    return [home, away];
  }

  static Spinx(home: IHeroLog, away: IHeroLog): [IHeroLog, IHeroLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      away.effect_resistance = 0;
      return [home, away];
    }
    const ratioHp = home.current_hp / home.hp;
    if (ratioHp <= 0.5) {
      home.intrinsic_status = 1;
      home.current_crit_rate += 20;
      home.current_atk_healing += 30;
      home.intrinsic_status = -1;
    }
    return [home, away];
  }

  static Valkyrie(home: IHeroLog, away: IHeroLog): [IHeroLog, IHeroLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      away.effect_resistance = 0;
      return [home, away];
    }
    if (home.intrinsic_status < 5) {
      home.intrinsic_status += 1;
    } else {
      home.intrinsic_status = -1;
    }
    const dmg = 0.02 * home.intrinsic_status * away.hp;
    away.current_hp -= dmg;

    return [home, away];
  }

  static Hera(home: IHeroLog, away: IHeroLog): [IHeroLog, IHeroLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      away.effect_resistance = 0;
      return [home, away];
    }

    console.log(
      '-----------------Hera-------------------',
      away.intrinsic_status,
      home.intrinsic_status,
    );

    if (away.intrinsic_status !== 0 && home.intrinsic_status == 0) {
      home.effect_resistance = 1;
      console.log(
        '-----------------Hera BB-------------------',
        home.name,
        home.current_hp,
        home.hp,
        away.name,
      );
      home.intrinsic_status += 1;
      away.current_atk *= 0.7;
    }

    const ratioHp = away.current_hp / away.hp;
    if (ratioHp <= 0.6) {
      const r = Math.floor(Math.random() * 100) + 1;
      if (r <= 60) {
        home.effect_resistance = 1;
        home.current_crit_rate += 10;
        console.log(
          '-----------------Hera A-------------------',
          home.name,
          home.current_hp,
          ratioHp,
          home.hp,
          away.name,
        );
      }
    }

    return [home, away];
  }

  static Darklord(home: IHeroLog, away: IHeroLog): [IHeroLog, IHeroLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      away.effect_resistance = 0;
      return [home, away];
    }

    const ratioHp = away.current_hp / away.hp;
    if (ratioHp <= 0.6) {
      home.current_atk *= 1.5;
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

  static Poseidon(home: IHeroLog, away: IHeroLog): [IHeroLog, IHeroLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      away.effect_resistance = 0;
      return [home, away];
    }

    if (home.intrinsic_status < 10) {
      home.intrinsic_status += 1;
    } else {
      home.intrinsic_status = -1;
    }

    home.current_atk *= 1.07;
    return [home, away];
  }

  static Fenrir(home: IHeroLog, away: IHeroLog): [IHeroLog, IHeroLog] {
    console.log(
      '-----------------Fenrir-------------------',
      home.name,
      away.name,
    );
    if (away.effect_resistance || home.intrinsic_status === -1) {
      console.log(
        '---------------Fenrir D---------------------',
        away.effect_resistance,
        home.intrinsic_status,
      );
      away.effect_resistance = 0;
      return [home, away];
    }

    home.current_crit_rate += 5;
    home.current_crit_dmg += 15;
    console.log(
      '-----------------Fenrir A-------------------',
      home.name,
      away.name,
    );

    home.intrinsic_status = -2;

    return [home, away];
  }

  static Chiron(home: IHeroLog, away: IHeroLog): [IHeroLog, IHeroLog] {
    if (away.effect_resistance) {
      away.effect_resistance = 0;
      return [home, away];
    }

    const ratioHp = away.current_hp / away.hp;
    if (ratioHp <= 0.6) {
      const r = Math.floor(Math.random() * 100) + 1;
      if (r <= 25) {
        home.effect_resistance = 1;
      }
      home.current_atk *= 1.15;
    }
    return [home, away];
  }

  static Phoenix(home: IHeroLog, away: IHeroLog): [IHeroLog, IHeroLog] {
    console.log('------------------------------------', home.name, away.name);
    if (away.effect_resistance || home.intrinsic_status === -1) {
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
      home.current_hp = home.hp;
      home.current_def *= 2;
      home.current_spd *= 2;
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
