import { IMatchLog } from '../../migrations/interfaces/match-log.interface';

export class SkillService {
  static resetSkill = (home, away): [IMatchLog, IMatchLog] => {
    home.is_active_skill = false;
    away.take_skill_dmg = 0;
    home.take_dmg = 0;
    away.effect_resistance = 0;
    return [home, away];
  };

  static Hell(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
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

    return [home, away];
  }

  static Sphinx(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }

    home.is_active_skill = true;

    away.current_def -= Math.round(
      30 + (away.current_def > 0 ? away.current_def * 0.1 : 0),
    );
    away.def -= Math.round(
      home.current_atk * 0.03 + (away.def > 0 ? away.def * 0.2 : 0),
    );

    if (home.turn_number % 2 === 0 && home.current_hp < away.current_hp) {
      home.current_atk = Math.round(home.current_atk * 1.2);
    }

    return [home, away];
  }

  static Valkyrie(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }

    if (home.intrinsic_status < 4) {
      home.intrinsic_status += 1;
    }

    home.is_active_skill = true;

    const dmg = Math.round(0.02 * home.intrinsic_status * away.hp);
    away.take_skill_dmg = dmg;
    away.current_hp -= dmg;

    return [home, away];
  }

  static Hera(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }

    if (away.intrinsic_status !== 0 && home.intrinsic_status == 0) {
      //Kick hoat skill
      home.is_active_skill = true;
      // Tang diem noi tai
      home.intrinsic_status = 1;
      away.current_atk = Math.round(away.current_atk * 0.8);
      away.atk = Math.round(away.atk * 0.8);
    }

    if (away.intrinsic_status === -1 || this.getRand() > 30) {
      home.current_crit_dmg = Math.round(home.current_crit_dmg * 1.1);
    } else {
      // Cam skill
      home.current_crit_rate += 5;
      home.effect_resistance = 1;
    }
    home.is_active_skill = true;

    return [home, away];
  }

  static getRand = () => {
    return Math.floor(Math.random() * 100) + 1;
  };

  static Darklord(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }

    const ratioHp = home.current_hp / home.hp;

    if (ratioHp <= 0.6) {
      home.is_active_skill = true;
      home.current_atk = Math.round(home.current_atk * 1.6);
      home.current_def = Math.round(home.current_def * 1.5);
      home.intrinsic_status = -1;
    }

    return [home, away];
  }

  static Poseidon(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }

    if (home.intrinsic_status < 10) {
      home.is_active_skill = true;
      home.intrinsic_status += 1;
      home.current_atk = Math.round(home.current_atk * 1.075);
      home.current_def = Math.round(home.current_def * 1.02);
    }

    return [home, away];
  }

  static Fenrir(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }

    home.is_active_skill = true;
    home.current_crit_rate += 5;
    home.current_crit_dmg += 20;
    home.intrinsic_status += 1;

    return [home, away];
  }

  static Chiron(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }

    home.is_active_skill = true;
    home.current_atk = Math.round(
      home.atk * (1 + ((home.hp - home.current_hp) / home.hp) * 0.85),
    );

    return [home, away];
  }

  static Phoenix(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }
    const skillDame = Math.round((home.hp - home.current_hp) * 0.09);
    away.current_hp -= skillDame;
    away.take_skill_dmg = skillDame;
    home.is_active_skill = true;

    return [home, away];
  }

  static Synthia(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }

    home.intrinsic_status += 1;
    away.take_skill_dmg = home.intrinsic_status * home.current_atk * 0.1;
    away.current_hp -= away.take_skill_dmg;

    return [home, away];
  }

  static Amon(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }
    home.is_active_skill = true;
    home.intrinsic_status += 1;
    home.current_hp += Math.round(home.current_atk * 0.3);
    away.current_def -= Math.round(
      (home.hp - home.current_hp) * 0.006 + (away.def > 0 ? away.def * 0.2 : 0),
    );

    return [home, away];
  }

  static Nezha(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    if (away.effect_resistance || home.intrinsic_status === -1) {
      return SkillService.resetSkill(home, away);
    }

    const ratioHp = home.current_hp / home.hp;
    if (ratioHp <= 0.5 && this.getRand() <= 50) {
      home.is_active_skill = true;
    }

    return [home, away];
  }
}
