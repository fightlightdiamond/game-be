import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserHeroRepository } from '../../../domain/repositories/user-hero.repository.interface';
import { UserHero } from '../../../domain/aggregates/user-hero.aggregate';
import { EloRating } from '../../../domain/value-objects/elo-rating.vo';
import { UserHeroOrmEntity } from './user-hero.orm-entity';

@Injectable()
export class TypeOrmUserHeroRepository implements IUserHeroRepository {
  constructor(
    @InjectRepository(UserHeroOrmEntity)
    private readonly orm: Repository<UserHeroOrmEntity>,
  ) {}

  async findById(id: number): Promise<UserHero | null> {
    const row = await this.orm.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByUserId(userId: number): Promise<UserHero | null> {
    const row = await this.orm.findOne({ where: { user_id: userId } });
    return row ? this.toDomain(row) : null;
  }

  async save(userHero: UserHero): Promise<UserHero> {
    const ormEntity = this.toOrm(userHero);
    const saved = await this.orm.save(ormEntity);
    return this.toDomain(saved);
  }

  async findLeaderboard(options: {
    page: number;
    limit: number;
  }): Promise<UserHero[]> {
    const rows = await this.orm.find({
      order: { elo: 'DESC' },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: UserHeroOrmEntity): UserHero {
    return new UserHero(
      row.id,
      row.user_id,
      row.hero_id,
      row.level,
      row.atk_point,
      row.def_point,
      row.hp_point,
      row.spd_point,
      row.crit_rate_point,
      new EloRating(row.elo),
      row.atk,
      row.def,
      row.hp,
      row.spd,
      row.crit_rate,
    );
  }

  private toOrm(userHero: UserHero): UserHeroOrmEntity {
    const row = new UserHeroOrmEntity();
    if (userHero.id) {
      row.id = userHero.id;
    }
    row.user_id = userHero.userId;
    row.hero_id = userHero.heroId;
    row.level = userHero.level;
    row.atk_point = userHero.atkPoint;
    row.def_point = userHero.defPoint;
    row.hp_point = userHero.hpPoint;
    row.spd_point = userHero.spdPoint;
    row.crit_rate_point = userHero.critRatePoint;
    row.elo = userHero.eloRating.getValue();
    row.atk = userHero.atk;
    row.def = userHero.def;
    row.hp = userHero.hp;
    row.spd = userHero.spd;
    row.crit_rate = userHero.critRate;
    return row;
  }
}
