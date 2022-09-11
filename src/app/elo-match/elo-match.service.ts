import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as __ from 'lodash';
import { In } from 'typeorm';
import Elo from '@studimax/elo';
import { IHero } from '../../migrations/interfaces/hero.interface';
import { HeroLog } from '../hero/hero.log';
import { UserHeroRepository } from '../user-hero/user-hero.repository';
import { MatchEntity } from '../../migrations/entities/match.entity';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import { SkillFactory } from '../skill/skill.factory';
import { probability } from '../../common/utils/hero.util';
import { IEloMatchLog } from '../../migrations/interfaces/elo-match-log.interface';
import { EloMatchRepository } from './elo-match.repository';

@Injectable()
export class EloMatchService {
  home: IEloMatchLog;
  away: IEloMatchLog;
  turn_number = 1;
  match: MatchEntity;
  hero_info: any = [];
  turns: any = [];

  constructor(
    private readonly userHeroRepository: UserHeroRepository,
    private readonly eloMatchRepository: EloMatchRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * fight
   *
   * @param user_id
   * @param competitor
   */
  async fight(user_id: number, competitor: number) {
    const userHero = await this.userHeroRepository.findOne({
      where: {
        user_id,
      },
      select: ['id'],
    });

    if (!userHero) {
      throw new HttpException(
        'Hero id not found',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const ids = [userHero.id, competitor];
    const heroes = await this.userHeroRepository.find({
      where: {
        id: In(ids),
      },
    });

    const logs = this.preBet(heroes[0], heroes[1]);
    return logs.execute();
  }

  /**
   * Chuẩn bi data
   *
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

    const elo = new Elo({ kFactor: 20 });
    const { Ra, Rb } = elo.calculateRating(
      this.home.elo,
      this.away.elo,
      this.home.current_hp > this.away.current_hp ? 1 : 0,
    );
    this.home.elo = Ra;
    this.away.elo = Rb;

    await this.userHeroRepository.update(
      {
        id: this.away.id,
      },
      {
        elo: Rb,
      },
    );

    const match = await this.eloMatchRepository.save(dataMatchUpdate);
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
    const [i, y]: [IEloMatchLog, IEloMatchLog] = SkillFactory.create(
      home,
      away,
    );
    home = i;
    away = y;

    // Dame
    let dame = home.current_atk;
    dame -= away.current_def;

    // Random xac suat crit
    const bProbability = probability();

    if (bProbability <= home.current_crit_rate) {
      dame = Math.round((dame * home.current_crit_dmg) / 100);
      home.is_crit = true;
    }

    away.take_dmg = dame;
    away.current_hp -= dame;

    this.turns.push(this.getData(home));
    this.turns.push(this.getData(away));
  }

  getData(home) {
    console.log({ home });
    return __.cloneDeep(home);
  }

  /**
   * Đánh
   */
  attack(home, away): IEloMatchLog[] {
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
