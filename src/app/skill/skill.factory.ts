/**
 * skill
 * @param home
 * @param away
 * @param log
 */
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';
import { SkillService } from './skill.service';

export class SkillFactory {
  static create(home: IMatchLog, away: IMatchLog): [IMatchLog, IMatchLog] {
    switch (home.name) {
      case 'Hell':
        return SkillService.Hell(home, away);
      case 'Sphinx':
        return SkillService.Spinx(home, away);
      case 'Darklord':
        return SkillService.Darklord(home, away);
      case 'Valkyrie':
        return SkillService.Valkyrie(home, away);
      case 'Poseidon':
        return SkillService.Poseidon(home, away);
      case 'Phoenix':
        return SkillService.Phoenix(home, away);
      case 'Chiron':
        return SkillService.Chiron(home, away);
      case 'Hera':
        return SkillService.Hera(home, away);
      case 'Fenrir':
        return SkillService.Fenrir(home, away);
      default:
        throw Error('Not found skill for Hero');
    }
  }
}
