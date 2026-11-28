import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IHeroRepository } from '../../../domain/repositories/hero.repository.interface';
import { Hero } from '../../../domain/hero';
import { HeroStats } from '../../../domain/value-objects/hero-stats.vo';
import { HeroOrmEntity } from './hero.orm-entity';

@Injectable()
export class TypeOrmHeroRepository implements IHeroRepository {
  constructor(
    @InjectRepository(HeroOrmEntity)
    private readonly orm: Repository<HeroOrmEntity>,
  ) {}

  async findById(id: number): Promise<Hero | null> {
    const row = await this.orm.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByName(name: string): Promise<Hero | null> {
    const row = await this.orm.findOne({ where: { name } });
    return row ? this.toDomain(row) : null;
  }

  async getPair(): Promise<[Hero, Hero]> {
    // Use RAND() ordering to match the existing getPairHeroes() logic
    const rows = await this.orm
      .createQueryBuilder('hero')
      .where('hero.status = :status', { status: 1 })
      .orderBy('RAND()')
      .limit(2)
      .getMany();

    if (rows.length < 2 || rows[0].id === rows[1].id) {
      throw new Error('A pair needs two distinct catalog heroes');
    }
    return [this.toDomain(rows[0]), this.toDomain(rows[1])];
  }

  async listAll(): Promise<Hero[]> {
    const rows = await this.orm.find();
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: HeroOrmEntity): Hero {
    const stats = new HeroStats(
      row.hp,
      row.atk,
      row.def,
      row.spd,
      row.crit_rate,
      row.crit_dmg,
      row.atk_healing,
      row.take_dmg_healing,
      row.dodge,
      row.acc,
      row.cc,
      row.effect_resistance,
      row.intrinsic_status,
    );
    return new Hero(
      row.id,
      row.name,
      row.element,
      row.position,
      row.story,
      row.guide,
      row.skill,
      stats,
    );
  }
}
