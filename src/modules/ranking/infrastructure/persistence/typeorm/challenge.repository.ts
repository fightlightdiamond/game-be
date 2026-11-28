import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from '../../../domain/challenge';
import { ChallengeRepository } from '../../../domain/repositories/challenge.repository';
import { ChallengeOrmEntity } from './challenge.orm-entity';

@Injectable()
export class TypeOrmChallengeRepository implements ChallengeRepository {
  constructor(
    @InjectRepository(ChallengeOrmEntity)
    private readonly orm: Repository<ChallengeOrmEntity>,
  ) {}

  async save(challenge: Challenge): Promise<Challenge> {
    const ormEntity = this.toOrm(challenge);
    const saved = await this.orm.save(ormEntity);
    return this.toDomain(saved);
  }

  async findByAccountId(accountId: number): Promise<Challenge[]> {
    const rows = await this.orm
      .createQueryBuilder('challenge')
      .where('challenge.winner = :accountId OR challenge.loser = :accountId', {
        accountId,
      })
      .getMany();
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: ChallengeOrmEntity): Challenge {
    return new Challenge(
      row.id,
      row.hero_info ? JSON.parse(row.hero_info) : [],
      row.turns ? JSON.parse(row.turns) : [],
      row.start_time ?? '',
      row.turn_number,
      row.status,
      row.winner,
      row.loser,
      0,
    );
  }

  private toOrm(challenge: Challenge): ChallengeOrmEntity {
    const row = new ChallengeOrmEntity();
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
