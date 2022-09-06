import { Command, Console } from 'nestjs-console';
import * as _ from 'lodash';
import { Hero } from '../../common/utils/hero.util';
import { IHero } from '../../migrations/interfaces/hero.interface';
import { HeroLog } from '../../app/hero/hero.log';
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';
import { MatchEntity } from '../../migrations/entities/match.entity';

@Console()
export class AfkConsole {
  home: IMatchLog;
  away: IMatchLog;
  turn_number = 1;
  match: MatchEntity;

  @Command({ command: 'war' })
  async war() {
    const a = new Hero();
    a.name = 'Valkyrie';
    const b = new Hero();
    b.name = 'Hell';
    this.preBet(a, b);
    await this.execute();
  }

  preBet(home: IHero, away: IHero) {
    this.turn_number = 1;
    this.home = new HeroLog().setHome(home).setCurrent();
    this.away = new HeroLog().setHome(away).setCurrent();
    return this;
  }

  async timeoutPromise() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('time out');
      }, 1000);
    });
  }

  info() {
    console.log(this.home);
    console.log(this.away);
    console.log('Who Win?');
  }

  /**
   * execute
   */
  async execute(): Promise<IMatchLog[]> {
    this.info();
    await this.timeoutPromise();
    // let logs: IMatchLog[] = [_.cloneDeep(this.home), _.cloneDeep(this.away)];
    let logs: IMatchLog[] = [];

    while (
      this.home.current_hp > 0 &&
      this.away.current_hp > 0 &&
      this.turn_number < 20
    ) {
      this.home.turn_number = this.turn_number;
      this.away.turn_number = this.turn_number;
      console.log('Round: ', this.turn_number);

      if (this.home.current_spd > this.away.current_spd) {
        const res = this.home.attack(_.cloneDeep(this.away));
        if (res.length == 2) {
          const [i, y] = res;
          this.home = i;
          this.away = y;
          logs = [...logs, _.cloneDeep(i), _.cloneDeep(y)];
        } else {
          res.forEach((hero, key) => {
            logs = [...logs, _.cloneDeep(hero)];
            if (key == 2) {
              this.home = hero;
            }
            if (key == 3) {
              this.away = hero;
            }
            if (key == 4) throw Error('fsfs');
          });
        }
      } else {
        const res = this.away.attack(_.cloneDeep(this.home));
        if (res.length == 2) {
          const [i, y] = res;
          this.home = y;
          this.away = i;

          logs = [...logs, _.cloneDeep(y), _.cloneDeep(i)];
        } else {
          res.forEach((hero, key) => {
            logs = [...logs, _.cloneDeep(hero)];
            if (key == 2) {
              this.away = hero;
            }
            if (key == 3) {
              this.home = hero;
            }
            if (key == 4) throw Error('fsfs');
          });
        }
      }

      this.turn_number++;
    }
    console.log('End War');
    return logs;
  }
}
