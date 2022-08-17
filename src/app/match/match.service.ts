import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { HeroLog } from '../hero/hero.log';
import { IHero } from '../../migrations/interfaces/hero.interface';
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';
import { MatchEntity } from '../../migrations/entities/match.entity';
import { HeroRepository } from '../hero/hero.repository';
import { MatchRepository } from './match.repository';

@Injectable()
export class MatchService {
  home: IMatchLog;
  away: IMatchLog;
  round = 1;
  match: MatchEntity;

  constructor(
    private readonly heroRepository: HeroRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async bet() {
    const heroes = await this.heroRepository.getPairHeroes();
    if (heroes.length !== 2) {
      throw Error("Can't match heroes");
    }

    const a = heroes[0];
    const b = heroes[1];
    const logs = await this.preBet(a, b);
    return logs.execute();
  }

  async preBet(home: IHero, away: IHero) {
    this.round = 1;
    this.home = new HeroLog().setHome(home).setCurrent();
    this.away = new HeroLog().setHome(away).setCurrent();
    this.match = await this.matchRepository.save({
      hero_info: JSON.stringify([
        JSON.parse(JSON.stringify(this.home)),
        JSON.parse(JSON.stringify(this.away)),
      ]),
    });
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
      this.round < 20
    ) {
      this.home.round = this.round;
      this.away.round = this.round;
      console.log('Round: ', this.round);

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

      this.round++;
    }
    console.log('End War');

    // this.match.turns = JSON.stringify(logs);
    await this.matchRepository.update(
      {
        id: this.match.id,
      },
      {
        turn_number: this.round,
        winner: this.home.current_hp > this.away.current_hp ? 1 : 0,
        loser: this.home.current_hp > this.away.current_hp ? 0 : 1,
        turns: JSON.stringify(logs),
      },
    );
    // await this.match.save();

    return logs;
  }
}
