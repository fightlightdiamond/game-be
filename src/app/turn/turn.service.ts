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
    const [i, y]: [IHeroLog, IHeroLog] = SkillFactory.create(home, away);
    home = i;
    away = y;
    const bProbability = probability();
    const dame = home.current_atk;
    console.log('DAME: ', dame);
    away.current_hp -= this.dameForCrit(bProbability, home, dame);

    console.log(
      'Turn: ------------> ',
      home.name,
      home.current_hp,
      away.name,
      away.current_hp,
    );
    return [home, away];
  }

  static dameForCrit(probability, home: IHeroLog, dame) {
    if (probability > home.current_crit_rate) {
      return dame;
    }
    console.log('Crit', home.name, (dame * home.current_crit_dmg) / 100);
    return (dame * home.current_crit_dmg) / 100;
  }
}
