import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { HeroLog } from '../hero/hero.log';
import { IHero } from '../../migrations/interfaces/hero.interface';
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';
import { MatchEntity } from '../../migrations/entities/match.entity';
import { HeroRepository } from '../hero/hero.repository';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import { MatchRepository } from './match.repository';

@Injectable()
export class MatchService {
  home: IMatchLog;
  away: IMatchLog;
  turn_number = 1;
  match: MatchEntity;

  constructor(
    private readonly heroRepository: HeroRepository,
    private readonly matchRepository: MatchRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async paginate(
    options: IPaginationOptions,
  ): Promise<Pagination<MatchEntity>> {
    const queryBuilder = this.matchRepository.createQueryBuilder('c');
    queryBuilder
      .orderBy('c.id', 'DESC')
      .where({
        status: BetStatusConstant.END,
      })
      .select(['c.id', 'c.winner', 'c.loser', 'c.turn_number', 'c.start_time']); // Or whatever you need to do
    return paginate<MatchEntity>(queryBuilder, options);
  }

  async bet() {
    const heroes = await this.heroRepository.getPairHeroes();

    const a = heroes[0];
    const b = heroes[1];
    const logs = await this.preBet(a, b);
    return logs.execute();
  }

  async preBet(home: IHero, away: IHero) {
    this.turn_number = 1;
    this.home = new HeroLog().setHome(home).setCurrent();
    this.away = new HeroLog().setHome(away).setCurrent();
    this.match = await this.matchRepository.save({
      hero_info: JSON.stringify([
        JSON.stringify(this.home),
        JSON.stringify(this.away),
      ]),
    });
    return this;
  }

  /**
   * execute
   */
  async execute(): Promise<MatchEntity> {
    let logs: IMatchLog[] = [];

    while (
      this.home.current_hp > 0 &&
      this.away.current_hp > 0 &&
      this.turn_number < 20
    ) {
      this.home.turn_number = this.turn_number;
      this.away.turn_number = this.turn_number;

      if (this.home.current_spd > this.away.current_spd) {
        const res = this.home.attack(this.away);

        if (res.length == 2) {
          const [i, y] = res;
          this.home = i;
          this.away = y;
          logs = [
            ...logs,
            JSON.parse(JSON.stringify(i)),
            JSON.parse(JSON.stringify(y)),
          ];
        } else {
          res.forEach((hero, key) => {
            logs = [...logs, JSON.parse(JSON.stringify(hero))];
            if (key == 2) {
              this.home = hero;
            }
            if (key == 3) {
              this.away = hero;
            }
          });
        }
      } else {
        const res = this.away.attack(this.home);
        if (res.length == 2) {
          const [i, y] = res;
          this.home = y;
          this.away = i;

          logs = [
            ...logs,
            JSON.parse(JSON.stringify(y)),
            JSON.parse(JSON.stringify(i)),
          ];
        } else {
          res.forEach((hero, key) => {
            logs = [...logs, JSON.parse(JSON.stringify(hero))];
            if (key == 2) {
              this.away = hero;
            }
            if (key == 3) {
              this.home = hero;
            }
          });
        }
      }

      this.turn_number++;
    }

    const dataMatchUpdate = {
      turn_number: this.turn_number,
      winner:
        this.home.current_hp > this.away.current_hp
          ? this.home.id
          : this.away.id,
      loser:
        this.home.current_hp > this.away.current_hp
          ? this.away.id
          : this.home.id,
      turns: JSON.stringify(logs),
      start_time: Date.now().toString(),
      status: BetStatusConstant.BETTING,
    };

    await this.matchRepository.update(
      {
        id: this.match.id,
      },
      {
        ...dataMatchUpdate,
      },
    );

    this.match.turn_number = dataMatchUpdate.turn_number;
    this.match.winner = dataMatchUpdate.winner;
    this.match.loser = dataMatchUpdate.loser;
    this.match.turns = dataMatchUpdate.turns;
    this.match.start_time = dataMatchUpdate.start_time;

    return this.match;
  }

  async find(id: number) {
    return this.matchRepository.findOne({
      where: {
        id,
      },
    });
  }

  async history() {
    return this.matchRepository.findOneByOrFail({
      id: 1,
    });
  }

  /**
   * Get current match
   */
  async current() {
    const id: number = await this.cacheManager.get('currentMatchId');
    const match = await this.matchRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!match) {
      return match;
    }

    switch (match.status) {
      case BetStatusConstant.PENDING:
        return {
          id: match.id,
          hero_info: match.hero_info,
          status: match.status,
          start_time: match.start_time,
        };
      case BetStatusConstant.BETTING:
        return {
          id: match.id,
          hero_info: match.hero_info,
          status: match.status,
          start_time: match.start_time,
        };
      case BetStatusConstant.FIGHTING:
        return match;
    }
  }

  async statistic(orderBy: string) {
    const oderByArr: string[] = ['lose_num', 'total', 'percent', 'win_num'];
    let orderQuery = '';
    if (oderByArr.includes(orderBy)) {
      orderQuery = `order by ${orderBy}`;
    }
    return this.matchRepository
      .query(`with win_table as (SELECT count(id) as win, winner FROM bet_herox.matches group by winner order by win),
 lose_table as (SELECT count(id) as lose, loser FROM bet_herox.matches group by loser order by lose)
 select id, name, win, lose, (win/lose) as percent, (win + lose) as total 
 from bet_herox.heroes
 left join lose_table on heroes.id = lose_table.loser
 left join win_table on heroes.id = win_table.winner
   ${orderQuery}`);
  }

  async statisticOne(id: number, orderBy: string) {
    const oderByArr: string[] = ['lose_num', 'total', 'percent', 'win_num'];
    let orderQuery = '';

    if (oderByArr.includes(orderBy)) {
      orderQuery = `order by ${orderBy}`;
    }

    const query = ` with win_table as (SELECT  count(id) as lose_num, loser, winner FROM bet_herox.matches where loser = ${id} group by winner),
 lose_table as (SELECT  count(id) as win_num, loser, winner FROM bet_herox.matches where winner = ${id} group by loser),
 hero_table as (SELECT id, name from bet_herox.heroes where id != ${id})
select id, name, win_num, lose_num, (win_num/lose_num) as percent, (win_num + lose_num) as total 
from hero_table
 left join lose_table on hero_table.id = lose_table.loser
 left join win_table on hero_table.id = win_table.winner
 ${orderQuery}`;
    return this.matchRepository.query(query);
  }
}
