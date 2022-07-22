import { IHero } from '../hero/interfaces/hero.interface';
import { Turn } from './turn';

export class War {
  home: IHero;
  away: IHero;
  round = 1;
  constructor(home: IHero, away: IHero) {
    this.home = home;
    this.away = away;
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
      this.round++;
      console.log('Round: ', this.round);
      if (this.home.current_spd > this.away.current_spd) {
        // this.atk(this.home, this.away);
        const [i, y] = this.home.attack(this.away);
        this.home = i;
        this.away = y;
      } else {
        // this.atk(this.away, this.home);
        const [i, y] = this.away.attack(this.home);
        this.home = y;
        this.away = i;
      }
    }
    console.log('End War');
  }

  /**
   * Atk
   * @param home
   * @param away
   */
  atk(home: IHero, away: IHero) {
    // 1
    const [home2, away2] = Turn.turn(home, away);
    this.home = home2;
    this.away = away2;
    if (away2.current_hp < 0) {
      console.log(this.home.name, 'WIN');
      return;
    }
    // 2
    const [away3, home3] = Turn.turn(away2, home2);
    this.home = home3;
    this.away = away3;
    if (home3.current_hp < 0) {
      console.log(this.away.name, 'WIN');
      return;
    }
  }
}
