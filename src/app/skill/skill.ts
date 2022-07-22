import { IHero } from '../hero/interfaces/hero.interface';

// const VINH_CUU_STATUS = -2;
// const DISABLE_STATUS = -1;
// const ENABLE_STATUS = 0;

export class Skill {
  static Hell(home: IHero, away: IHero) {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      away.effect_resistance = 0;
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

  static Spinx(home: IHero, away: IHero) {
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

  static Valkyrie(home: IHero, away: IHero) {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      away.effect_resistance = 0;
      return [home, away];
    }
    if (home.intrinsic_status < 5) {
      home.intrinsic_status += 1;
    } else {
      home.intrinsic_status = -1;
    }
    away.current_hp -= 0.02 * home.intrinsic_status * away.hp;
    return [home, away];
  }

  static Hera(home: IHero, away: IHero) {
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

  static Darklord(home: IHero, away: IHero) {
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

  static Poseidon(home: IHero, away: IHero) {
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

  static Fenrir(home: IHero, away: IHero) {
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

  static Chiron(home: IHero, away: IHero) {
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

  static Jormungandr(home: IHero, away: IHero) {
    console.log(
      '-----------------Jormungandr-------------------',
      home.name,
      away.name,
    );
    if (away.effect_resistance || home.intrinsic_status === -1) {
      away.effect_resistance = 0;
      console.log(
        '---------------Jormungandr D---------------------',
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
        '-----------------Jormungandr A-------------------',
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
