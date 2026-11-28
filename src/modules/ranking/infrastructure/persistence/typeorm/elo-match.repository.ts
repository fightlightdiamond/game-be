import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEloMatchRepository } from '../../../domain/repositories/elo-match.repository.interface';
import { EloMatch } from '../../../domain/entities/elo-match.entity';
import { EloMatchOrmEntity } from './elo-match.orm-entity';

@Injectable()
export class TypeOrmEloMatchRepository implements IEloMatchRepository {
  constructor(
    @InjectRepository(EloMatchOrmEntity)
    private readonly orm: Repository<EloMatchOrmEntity>,
  ) {}

  async save(eloMatch: EloMatch): Promise<EloMatch> {
    const ormEntity = this.toOrm(eloMatch);
    const saved = await this.orm.save(ormEntity);
    return this.toDomain(saved);
  }

  async findByUserId(userId: number): Promise<EloMatch[]> {
    const rows = await this.orm
      .createQueryBuilder('elo_match')
      .where('elo_match.winner = :userId OR elo_match.loser = :userId', {
        userId,
      })
      .getMany();
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: EloMatchOrmEntity): EloMatch {
    return new EloMatch(
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

  private toOrm(eloMatch: EloMatch): EloMatchOrmEntity {
    const row = new EloMatchOrmEntity();
    if (eloMatch.id) {
      row.id = eloMatch.id;
    }
    row.hero_info = JSON.stringify(eloMatch.heroInfo);
    row.turns = JSON.stringify(eloMatch.turns);
    row.start_time = eloMatch.startTime;
    row.turn_number = eloMatch.turnNumber;
    row.status = eloMatch.status;
    row.winner = eloMatch.winner;
    row.loser = eloMatch.loser;
    row.type = 0;
    return row;
  }
}
