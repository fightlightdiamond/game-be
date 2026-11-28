import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StakeRepository } from '../../../domain/repositories/stake.repository';
import { Stake } from '../../../domain/stake';
import { BetOrmEntity } from './bet.orm-entity';

@Injectable()
export class TypeOrmStakeRepository implements StakeRepository {
  constructor(
    @InjectRepository(BetOrmEntity)
    private readonly orm: Repository<BetOrmEntity>,
  ) {}

  async findByAccountAndMatch(
    accountId: number,
    matchId: number,
  ): Promise<Stake | null> {
    const row = await this.orm.findOne({
      where: { match_id: matchId, user_id: accountId },
    });
    if (!row) {
      return null;
    }
    return new Stake(
      row.id,
      row.user_id,
      row.match_id,
      row.hero_id,
      Number(row.balance),
    );
  }
}
