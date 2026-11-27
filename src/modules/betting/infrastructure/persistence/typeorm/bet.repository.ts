import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBetRepository } from '../../../domain/repositories/bet.repository.interface';
import { Bet } from '../../../domain/entities/bet.entity';
import { BetOrmEntity } from './bet.orm-entity';

@Injectable()
export class TypeOrmBetRepository implements IBetRepository {
  constructor(
    @InjectRepository(BetOrmEntity)
    private readonly orm: Repository<BetOrmEntity>,
  ) {}

  async findByMatchAndHero(matchId: number, heroId: number): Promise<Bet[]> {
    const rows = await this.orm.find({
      where: { match_id: matchId, hero_id: heroId },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findByMatchAndUser(
    matchId: number,
    userId: number,
  ): Promise<Bet | null> {
    const row = await this.orm.findOne({
      where: { match_id: matchId, user_id: userId },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(bet: Bet): Promise<Bet> {
    const row = this.toOrm(bet);
    const savedRow = await this.orm.save(row);
    return this.toDomain(savedRow);
  }

  private toDomain(row: BetOrmEntity): Bet {
    return new Bet(
      row.id,
      row.user_id,
      row.match_id,
      row.hero_id,
      Number(row.balance),
      row.result,
    );
  }

  private toOrm(bet: Bet): BetOrmEntity {
    const row = new BetOrmEntity();
    if (bet.id) {
      row.id = bet.id;
    }
    row.user_id = bet.userId;
    row.match_id = bet.matchId;
    row.hero_id = bet.heroId;
    row.balance = bet.balance;
    row.result = bet.result;
    return row;
  }
}
