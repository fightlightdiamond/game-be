import { IHero } from './hero.interface';
import { IMatchLog } from './match-log.interface';

export interface IEloMatchLog extends IMatchLog {
  elo?: number;
  attack(away: IEloMatchLog): IEloMatchLog[];
  setHome(home: IHero): IEloMatchLog;
  setCurrent(): IEloMatchLog;
}
