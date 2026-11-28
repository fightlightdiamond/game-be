import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnedHero } from '../../../domain/owned-hero';
import { IUserHeroRepository } from '../../../domain/repositories/user-hero.repository.interface';
import { rowToOwned, toOwnedColumns } from './owned-hero.mapper';
import { UserHeroOrmEntity } from './user-hero.orm-entity';

@Injectable()
export class TypeOrmUserHeroRepository implements IUserHeroRepository {
  constructor(
    @InjectRepository(UserHeroOrmEntity)
    private readonly orm: Repository<UserHeroOrmEntity>,
  ) {}

  async findById(id: number): Promise<OwnedHero | null> {
    const row = await this.orm.findOne({ where: { id } });
    return row ? rowToOwned(row) : null;
  }

  async findByUserId(userId: number): Promise<OwnedHero | null> {
    const row = await this.orm.findOne({ where: { user_id: userId } });
    return row ? rowToOwned(row) : null;
  }

  async save(hero: OwnedHero): Promise<OwnedHero> {
    const saved = await this.orm.save(toOwnedColumns(hero));
    return rowToOwned(saved);
  }

  async findLeaderboard(options: {
    page: number;
    limit: number;
  }): Promise<OwnedHero[]> {
    const rows = await this.orm.find({
      order: { elo: 'DESC' },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    });
    return rows.map((row) => rowToOwned(row));
  }
}
