import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GemType } from '../../../domain/gem';
import { GemRepository } from '../../../domain/repositories/gem.repository';
import { addLevelOneIn, levelUpGemIn } from './gem.statements';

@Injectable()
export class TypeOrmGemRepository implements GemRepository {
  constructor(private readonly dataSource: DataSource) {}

  async addLevelOne(accountId: number, type: GemType): Promise<void> {
    return this.dataSource.transaction((manager) =>
      addLevelOneIn(
        (sql, params) => manager.query(sql, params),
        accountId,
        type,
      ),
    );
  }

  async levelUp(
    accountId: number,
    type: GemType,
    level: number,
    spent: number,
    roll: number,
  ): Promise<{ gained: boolean }> {
    return this.dataSource.transaction((manager) =>
      levelUpGemIn(
        (sql, params) => manager.query(sql, params),
        accountId,
        type,
        level,
        spent,
        roll,
      ),
    );
  }
}
