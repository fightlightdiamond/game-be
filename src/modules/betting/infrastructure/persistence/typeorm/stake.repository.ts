import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StakeRepository } from '../../../domain/repositories/stake.repository';
import { Stake } from '../../../domain/stake';
import { StakeOrmEntity } from './stake.orm-entity';

@Injectable()
export class TypeOrmStakeRepository implements StakeRepository {
  constructor(
    @InjectRepository(StakeOrmEntity)
    private readonly orm: Repository<StakeOrmEntity>,
  ) {}

  async findByAccountAndMatch(
    accountId: number,
    matchId: number,
  ): Promise<Stake | null> {
    const row = await this.orm.findOne({
      where: { house_match_id: matchId, account_id: accountId },
    });
    if (!row) {
      return null;
    }
    return new Stake(
      row.id,
      row.account_id,
      row.house_match_id,
      row.hero_id,
      Number(row.amount),
    );
  }
}
