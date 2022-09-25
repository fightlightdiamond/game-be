import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
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
