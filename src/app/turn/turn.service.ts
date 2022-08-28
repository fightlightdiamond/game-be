import * as _ from 'lodash';
import { SkillFactory } from '../skill/skill.factory';
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';
import { probability } from '../../common/utils/hero.util';

export class TurnService {
  /**
   * Turn
   * @param home
   * @param away
   */
  static turn(home: IMatchLog, away: IMatchLog) {
    //Reset
    home.is_active_skill = false;
    home.take_skill_dmg = 0;
    home.is_active_skill = false;
    home.take_dmg = 0;

    away.is_active_skill = false;
    away.take_dmg = 0;
    away.is_active_skill = false;
    away.take_skill_dmg = 0;
    // Skill
    const [i, y]: [IMatchLog, IMatchLog] = SkillFactory.create(home, away);
    home = _.cloneDeep(i);
    away = _.cloneDeep(y);

    // Dame
    let dame = home.current_atk;

    // Random sac xuat
    const bProbability = probability();

    if (bProbability <= home.current_crit_rate) {
      dame = Math.round((dame * home.current_crit_dmg) / 100);
      home.is_crit = true;
    }

    dame -= away.current_def;
    away.take_dmg = dame;
    away.current_hp -= dame;

    return [_.cloneDeep(home), _.cloneDeep(away)];
  }
}
