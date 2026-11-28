import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnedHero } from '../../../domain/owned-hero';
import { OwnedHeroRepository } from '../../../domain/repositories/owned-hero.repository';
import { rowToOwned, toOwnedColumns } from './owned-hero.mapper';
import { OwnedHeroOrmEntity } from './owned-hero.orm-entity';

@Injectable()
export class TypeOrmOwnedHeroRepository implements OwnedHeroRepository {
  constructor(
    @InjectRepository(OwnedHeroOrmEntity)
    private readonly orm: Repository<OwnedHeroOrmEntity>,
  ) {}

  async findById(id: number): Promise<OwnedHero | null> {
    const row = await this.orm.findOne({ where: { id } });
    return row ? rowToOwned(row) : null;
  }

  async findByAccountId(accountId: number): Promise<OwnedHero | null> {
    const row = await this.orm.findOne({ where: { account_id: accountId } });
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
