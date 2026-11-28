import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from '../../../domain/challenge';
import { IEloMatchRepository } from '../../../domain/repositories/elo-match.repository.interface';
import { EloMatchOrmEntity } from './elo-match.orm-entity';

@Injectable()
export class TypeOrmEloMatchRepository implements IEloMatchRepository {
  constructor(
    @InjectRepository(EloMatchOrmEntity)
    private readonly orm: Repository<EloMatchOrmEntity>,
  ) {}

  async save(challenge: Challenge): Promise<Challenge> {
    const ormEntity = this.toOrm(challenge);
    const saved = await this.orm.save(ormEntity);
    return this.toDomain(saved);
  }

  async findByUserId(userId: number): Promise<Challenge[]> {
    const rows = await this.orm
      .createQueryBuilder('elo_match')
      .where('elo_match.winner = :userId OR elo_match.loser = :userId', {
        userId,
      })
      .getMany();
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: EloMatchOrmEntity): Challenge {
    return new Challenge(
      row.id,
      row.hero_info ? JSON.parse(row.hero_info) : [],
      row.turns ? JSON.parse(row.turns) : [],
      row.start_time ?? '',
      row.turn_number,
      row.status,
      row.winner,
      row.loser,
      0, // userId not stored in this table — use winner as proxy
    );
  }

  private toOrm(challenge: Challenge): EloMatchOrmEntity {
    const row = new EloMatchOrmEntity();
    if (challenge.id) {
      row.id = challenge.id;
    }
    row.hero_info = JSON.stringify(challenge.heroInfo);
    row.turns = JSON.stringify(challenge.turns);
    row.start_time = challenge.startTime;
    row.turn_number = challenge.turnNumber;
    row.status = challenge.status;
    row.winner = challenge.winner;
    row.loser = challenge.loser;
    row.type = 0;
    return row;
  }
}
