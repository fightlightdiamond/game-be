import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBettingMatchRepository } from '../../../domain/repositories/betting-match.repository.interface';
import { BettingMatch } from '../../../domain/aggregates/betting-match.aggregate';
import { MatchStatus } from '../../../domain/value-objects/match-status.vo';
import { BettingMatchOrmEntity } from './betting-match.orm-entity';

@Injectable()
export class TypeOrmBettingMatchRepository implements IBettingMatchRepository {
  constructor(
    @InjectRepository(BettingMatchOrmEntity)
    private readonly orm: Repository<BettingMatchOrmEntity>,
  ) {}

  async findById(id: number): Promise<BettingMatch | null> {
    const row = await this.orm.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(match: BettingMatch): Promise<BettingMatch> {
    const row = this.toOrm(match);
    const savedRow = await this.orm.save(row);
    return this.toDomain(savedRow);
  }

  async findCurrentMatchId(): Promise<number | null> {
    const row = await this.orm
      .createQueryBuilder('match')
      .where('match.status = :betting OR match.status = :fighting', {
        betting: MatchStatus.BETTING,
        fighting: MatchStatus.FIGHTING,
      })
      .orderBy('match.id', 'DESC')
      .select(['match.id'])
      .getOne();
    return row ? row.id : null;
  }

  async findStatistics(id?: number): Promise<Array<Record<string, unknown>>> {
    if (id !== undefined) {
      // Per-hero statistics: how the given hero performed against each opponent
      const query = `
        WITH win_table AS (
          SELECT COUNT(id) AS lose_num, loser, winner
          FROM matches
          WHERE loser = ?
          GROUP BY winner
        ),
        lose_table AS (
          SELECT COUNT(id) AS win_num, loser, winner
          FROM matches
          WHERE winner = ?
          GROUP BY loser
        ),
        hero_table AS (
          SELECT id, name FROM heroes WHERE id != ?
        )
        SELECT
          id,
          name,
          win_num,
          lose_num,
          (win_num / lose_num) AS percent,
          (win_num + lose_num) AS total
        FROM hero_table
        LEFT JOIN lose_table ON hero_table.id = lose_table.loser
        LEFT JOIN win_table ON hero_table.id = win_table.winner
      `;
      return this.orm.query(query, [id, id, id]);
    }

    // Overall statistics across all heroes
    const query = `
      WITH win_table AS (
        SELECT COUNT(id) AS win, winner FROM matches GROUP BY winner ORDER BY win
      ),
      lose_table AS (
        SELECT COUNT(id) AS lose, loser FROM matches GROUP BY loser ORDER BY lose
      )
      SELECT
        id,
        name,
        win,
        lose,
        (win / lose) AS percent,
        (win + lose) AS total
      FROM heroes
      LEFT JOIN lose_table ON heroes.id = lose_table.loser
      LEFT JOIN win_table ON heroes.id = win_table.winner
    `;
    return this.orm.query(query);
  }

  private toDomain(row: BettingMatchOrmEntity): BettingMatch {
    return BettingMatch.reconstitute(
      row.id,
      row.status,
      row.hero_info ? JSON.parse(row.hero_info) : [],
      row.winner,
      row.loser,
      row.turns ? JSON.parse(row.turns) : [],
      row.turn_number,
      row.start_time ?? '',
      [], // bets — not loaded here, loaded separately
    );
  }

  private toOrm(match: BettingMatch): BettingMatchOrmEntity {
    const row = new BettingMatchOrmEntity();
    row.id = match.id || undefined; // 0 means new record
    row.hero_info = JSON.stringify(match.heroInfo);
    row.turns = JSON.stringify(match.turns);
    row.turn_number = match.turnNumber;
    row.status = match.status;
    row.winner = match.winner; // 0 until FIGHTING
    row.loser = match.loser;
    row.start_time = match.startTime;
    row.type = 0;
    return row;
  }
}
