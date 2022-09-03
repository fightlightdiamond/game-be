import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { HeroRepository } from '../hero/hero.repository';
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import { MatchEntity } from '../../migrations/entities/match.entity';
import { IHero } from '../../migrations/interfaces/hero.interface';
import { HeroLog } from '../hero/hero.log';
import { SkillFactory } from '../skill/skill.factory';
import { probability } from '../../common/utils/hero.util';
import { MatchRepository } from './match.repository';

@Injectable()
export class RoundService {
  home: IMatchLog;
  away: IMatchLog;
  turn = 1;
  match: MatchEntity;
  hero_info: any;
  turns: string;
  logs: any;

  constructor(
    private readonly heroRepository: HeroRepository,
    private readonly matchRepository: MatchRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Chuẩn bi data
   * @param home
   * @param away
   */
  preBet(home: IHero, away: IHero) {
    this.turn = 1;
    this.home = new HeroLog().setHome(home).setCurrent();
    this.away = new HeroLog().setHome(away).setCurrent();

    this.logs = {};
    this.logs[this.home.u_id] = [];
    this.logs[this.away.u_id] = [];

    this.hero_info = [
      JSON.parse(JSON.stringify(this.home)),
      JSON.parse(JSON.stringify(this.away)),
    ];

    return this;
  }

  /**
   * execute
   */
  async execute(): Promise<MatchEntity> {
    while (
      this.home.current_hp > 0 &&
      this.away.current_hp > 0 &&
      this.turn < 20
    ) {
      this.home.turn = this.turn;
      this.away.turn = this.turn;

      if (this.home.current_spd > this.away.current_spd) {
        this.attack(this.home, this.away);
      } else {
        this.attack(this.away, this.home);
      }

      this.turn++;
    }

    const dataMatchUpdate = {
      hero_info: this.hero_info,
      turn_number: this.turn,
      winner:
        this.home.current_hp > this.away.current_hp
          ? this.home.id
          : this.away.id,
      loser:
        this.home.current_hp > this.away.current_hp
          ? this.away.id
          : this.home.id,
      turns: this.logs,
      start_time: Date.now().toString(),
      status: BetStatusConstant.BETTING,
    };

    return this.matchRepository.save(dataMatchUpdate);
  }

  /**
   * Tấn công của turn
   * @param home
   * @param away
   */
  turnAtk(home, away) {
    //Reset
    home.is_active_skill = false;
    home.take_skill_dmg = 0;
    home.is_active_skill = false;
    home.take_dmg = 0;

    away.is_active_skill = false;
    away.take_dmg = 0;
    away.is_active_skill = false;
    away.take_skill_dmg = 0;
    // Skill
    const [i, y]: [IMatchLog, IMatchLog] = SkillFactory.create(home, away);
    home = i;
    away = y;

    // Dame
    let dame = home.current_atk;

    // Random xac suat crit
    const bProbability = probability();

    if (bProbability <= home.current_crit_rate) {
      dame = Math.round((dame * home.current_crit_dmg) / 100);
      home.is_crit = true;
    }

    dame -= away.current_def;
    away.take_dmg = dame;
    away.current_hp -= dame;

    this.logs[home.u_id].push(this.getData(home));
    this.logs[away.u_id].push(this.getData(away));
  }

  getData(home) {
    const data = JSON.parse(JSON.stringify(home));
    const delArr = [
      'atk',
      'def',
      'hp',
      'spd',
      'crit_dmg',
      'crit_rate',
      'id',
      'u_id',
      'name',
    ];
    delArr.forEach((name) => {
      delete data[name];
    });

    return data;
  }

  /**
   * Đánh
   */
  attack(home, away): IMatchLog[] {
    // Turn 2
    this.home.is_atk = true;
    this.away.is_atk = false;
    this.turnAtk(home, away);

    if (this.home.current_hp <= 0 || this.away.current_hp < 0) {
      return;
    }

    // Turn 2
    this.away.is_atk = true;
    this.home.is_atk = false;
    this.turnAtk(away, home);

    return;
  }
}
