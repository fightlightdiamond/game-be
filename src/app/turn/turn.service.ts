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
    const bProbability = probability();
    let dame = home.current_atk;
    console.log('Dame', home.name, dame);
    if (bProbability <= home.current_crit_rate) {
      dame = (dame * home.current_crit_dmg) / 100;
      console.log('Crit', home.name, dame);
      home.is_crit = true;
    }
    away.take_dmg = dame;
    console.log('Take dame', away.name, away.take_dmg);
    away.current_hp -= dame;
    console.log('HP', away.name, away.current_hp);
    return [home, away];
  }
}
