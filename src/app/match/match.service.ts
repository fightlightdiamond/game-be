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
      }, 10000);
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
  async execute() {
    this.info();
    await this.timeoutPromise();

    while (
      this.home.current_hp > 0 &&
      this.away.current_hp > 0 &&
      this.round < 20
    ) {
      console.log('Round: ', this.round);

      if (this.home.current_spd > this.away.current_spd) {
        const [i, y] = this.home.attack(this.away);
        this.home = i;
        this.away = y;
      } else {
        const [i, y] = this.away.attack(this.home);
        this.home = y;
        this.away = i;
      }

      this.round++;
    }
    console.log('End War');
  }
}
