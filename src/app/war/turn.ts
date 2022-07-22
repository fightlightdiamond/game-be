import { IHero, probability } from '../hero/interfaces/hero.interface';
import { Skill } from '../skill/skill';

export class Turn {
  /**
   * Turn
   * @param home
   * @param away
   */
  static turn(home: IHero, away: IHero) {
    const [i, y] = this.skill(home, away);
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
    // console.log('Turn: ------------> ', home, away);
    return [home, away];
  }

  static dameForCrit(probability, home: IHero, dame) {
    if (probability > home.current_crit_rate) {
      return dame;
    }
    console.log('Crit', home.name, (dame * home.current_crit_dmg) / 100);
    return (dame * home.current_crit_dmg) / 100;
  }

  /**
   * skill
   * @param home
   * @param away
   */
  static skill(home: IHero, away: IHero) {
    switch (home.name) {
      case 'Hell':
        return Skill.Hell(home, away);
      case 'Spinx':
        return Skill.Spinx(home, away);
      case 'Darklord':
        return Skill.Darklord(home, away);
      case 'Valkyrie':
        return Skill.Valkyrie(home, away);
      case 'Poseidon':
        return Skill.Poseidon(home, away);
      case 'Jormungandr':
        return Skill.Jormungandr(home, away);
      case 'Chiron':
        return Skill.Chiron(home, away);
      case 'Hera':
        return Skill.Hera(home, away);
      case 'Fenrir':
        return Skill.Fenrir(home, away);
      default:
        throw Error('Not found skill for Hero');
    }
  }
}
