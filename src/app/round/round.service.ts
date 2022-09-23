import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as __ from 'lodash';
import { HeroRepository } from '../hero/hero.repository';
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import { MatchEntity } from '../../migrations/entities/match.entity';
import { IHero } from '../../migrations/interfaces/hero.interface';
import { HeroLog } from '../hero/hero.log';
import { SkillFactory } from '../skill/skill.factory';
import { probability } from '../../common/utils/hero.util';
import { MatchRepository } from '../match/match.repository';

@Injectable()
export class RoundService {
  home: IMatchLog;
  away: IMatchLog;
  turn_number = 1;
  match: MatchEntity;
  hero_info: any = [];
  turns: any = [];

  constructor(
    private readonly heroRepository: HeroRepository,
    private readonly matchRepository: MatchRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async bet() {
    const heroes = await this.heroRepository.getPairHeroes();

    const a = heroes[0];
    const b = heroes[1];
    const logs = this.preBet(a, b);
    return logs.execute();
  }

  /**
   * Chuẩn bi data
   * @param home
   * @param away
   */
  preBet(home: IHero, away: IHero) {
    this.turn_number = 1;
    this.home = new HeroLog().setHome(home).setCurrent();
    this.away = new HeroLog().setHome(away).setCurrent();
    this.turns = [];
    this.hero_info = [__.cloneDeep(this.home), __.cloneDeep(this.away)];

    return this;
  }

  /**
   * execute
   */
  async execute(): Promise<MatchEntity> {
    while (
      this.home.current_hp > 0 &&
      this.away.current_hp > 0 &&
      this.turn_number < 20
    ) {
      this.home.turn_number = this.turn_number;
      this.away.turn_number = this.turn_number;

      if (this.home.current_spd > this.away.current_spd) {
        this.attack(this.home, this.away);
      } else {
        this.attack(this.away, this.home);
      }

      this.turn_number++;
    }

    const dataMatchUpdate = {
      hero_info: this.hero_info,
      turn_number: this.turn_number,
      winner:
        this.home.current_hp > this.away.current_hp
          ? this.home.id
          : this.away.id,
      loser:
        this.home.current_hp > this.away.current_hp
          ? this.away.id
          : this.home.id,
      turns: this.turns,
      start_time: Date.now().toString(),
      status: BetStatusConstant.BETTING,
    };

    const match = await this.matchRepository.save(dataMatchUpdate);
    match.winner = 0;
    match.loser = 0;
    match.turns = [];
    return match;
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

    // Random xac suat ne'
    const dodgeProbability = probability();
    if (dodgeProbability > away.dodge) {
      // Dame
      let dame = home.current_atk;
      dame -= away.current_def;

      // Random xac suat crit
      const bProbability = probability();

      if (bProbability <= home.current_crit_rate) {
        dame = Math.round((dame * home.current_crit_dmg) / 100);
        home.is_crit = true;
      }

      // Neu dame < 0 thi mac dinh doi phuong mat 1 HP
      if (dame < 0) {
        dame = 1;
      }

      // Neu tuong la` Nezha
      const ratioHp = home.current_hp / home.hp;
      if (home.name == 'Nezha' && ratioHp <= 0.5) {
        if (home.is_active_skill) {
          const skillDame = dame;
          away.current_hp -= skillDame;
          away.take_skill_dmg = skillDame;
        } else {
          // Hoi HP tuong duong 50% dame
          home.current_hp += Math.round(dame * 0.5);
        }
      }

      away.take_dmg = dame;
      away.current_hp -= dame;
    }

    this.turns.push(this.getData(home));
    this.turns.push(this.getData(away));
  }

  getData(home) {
    const data = __.cloneDeep(home);
    // const delArr = [
    //   'atk',
    //   'def',
    //   'hp',
    //   'spd',
    //   'crit_dmg',
    //   'crit_rate',
    //   'id',
    //   'u_id',
    //   'name',
    // ];
    // delArr.forEach((name) => {
    //   delete data[name];
    // });

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
