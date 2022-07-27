import { HeroLog, IHeroLog } from '../hero/hero.log';
import { IHero } from '../hero/interfaces/hero.interface';

export class MatchService {
  home: IHeroLog;
  away: IHeroLog;
  round = 1;
  constructor(home: IHero, away: IHero) {
    this.home = new HeroLog().setHome(home);
    this.away = new HeroLog().setHome(away);
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
  async execute(): Promise<IHeroLog[]> {
    this.info();
    await this.timeoutPromise();
    const logs: IHeroLog[] = [];

    while (
      this.home.current_hp > 0 &&
      this.away.current_hp > 0 &&
      this.round < 20
    ) {
      console.log('Round: ', this.round);

      if (this.home.current_spd > this.away.current_spd) {
        const res = this.home.attack(this.away);
        if (res.length == 2) {
          const [i, y] = res;
          this.home = i;
          this.away = y;
          logs.push(this.home);
          logs.push(this.away);
        } else {
          res.forEach((hero, key) => {
            logs.push(hero);
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
        const res = this.away.attack(this.home);
        if (res.length == 2) {
          const [i, y] = res;
          this.home = y;
          this.away = i;
          logs.push(this.home);
          logs.push(this.away);
        } else {
          res.forEach((hero, key) => {
            logs.push(hero);
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

      this.round++;
    }
    console.log('End War');
    return logs;
  }
}
