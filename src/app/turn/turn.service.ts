import * as _ from 'lodash';
import { probability } from '../hero/interfaces/hero.interface';
import { SkillFactory } from '../skill/skill.factory';
import { IHeroLog } from '../hero/hero.log';

export class TurnService {
  /**
   * Turn
   * @param home
   * @param away
   */
  static turn(home: IHeroLog, away: IHeroLog) {
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
    const [i, y]: [IHeroLog, IHeroLog] = SkillFactory.create(home, away);
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
    return [home, away];
  }
}
