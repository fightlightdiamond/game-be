import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HouseMatch } from '../../../domain/house-match';
import { RewardsPaid } from '../../../domain/events/rewards-paid.event';
import { HouseMatchNotFoundException } from '../../../domain/exceptions/stake-refused.exception';
import { HouseMatchRepository } from '../../../domain/repositories/house-match.repository';
import { Stake } from '../../../domain/stake';
import { Phase } from '../../../domain/phase';
import { HouseMatchOrmEntity } from './house-match.orm-entity';
import { rowToMatch, toMatchColumns } from './house-match.mapper';
import { placeStakeIn, settleIn } from './house-match.statements';

@Injectable()
export class TypeOrmHouseMatchRepository implements HouseMatchRepository {
  constructor(
    @InjectRepository(HouseMatchOrmEntity)
    private readonly orm: Repository<HouseMatchOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: number): Promise<HouseMatch | null> {
    const row = await this.orm.findOne({ where: { id } });
    return row ? rowToMatch(row) : null;
  }

  async findCurrent(): Promise<HouseMatch | null> {
    const row = await this.orm
      .createQueryBuilder('match')
      .where('match.phase IN (:...phases)', {
        phases: [Phase.Open, Phase.Revealed],
      })
      .orderBy('match.id', 'DESC')
      .getOne();
    return row ? rowToMatch(row) : null;
  }

  async open(
    match: HouseMatch,
  ): Promise<{ match: HouseMatch; created: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let committed = false;
    let existingId: number | null = null;
    let createdMatch: HouseMatch | null = null;
    try {
      const lockRows = await queryRunner.query(
        `SELECT GET_LOCK('house_match', 10) AS locked`,
      );
      if (Number(lockRows?.[0]?.locked) !== 1) {
        throw new Error('Could not lock the house match');
      }
      const current: Array<{ id: number }> = await queryRunner.query(
        'SELECT id FROM house_matches WHERE phase IN (?, ?) ORDER BY id DESC LIMIT 1',
        [Phase.Open, Phase.Revealed],
      );
      if (current.length > 0) {
        existingId = current[0].id;
      } else {
        const columns = toMatchColumns(match);
        const raw = await queryRunner.query(
          `INSERT INTO house_matches (hero_info, turns, start_time, turn_number, phase, winner, loser, type)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
          [
            columns.heroInfo,
            columns.turns,
            columns.openedAt,
            columns.turnNumber,
            columns.phase,
            columns.winner,
            columns.loser,
          ],
        );
        createdMatch = match.withId(Number(raw.insertId));
      }
      await queryRunner.commitTransaction();
      committed = true;
    } catch (error) {
      if (!committed) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      try {
        await queryRunner.query(`SELECT RELEASE_LOCK('house_match')`);
      } catch {
        // The connection is already closed.
      }
      await queryRunner.release();
    }

    if (createdMatch) {
      return { match: createdMatch, created: true };
    }
    const existing = await this.findById(existingId);
    if (!existing) {
      throw new HouseMatchNotFoundException(existingId);
    }
    return { match: existing, created: false };
  }

  async save(match: HouseMatch): Promise<void> {
    const columns = toMatchColumns(match);
    await this.dataSource.query(
      `UPDATE house_matches
       SET hero_info = ?, turns = ?, start_time = ?, turn_number = ?, phase = ?, winner = ?, loser = ?
       WHERE id = ?`,
      [
        columns.heroInfo,
        columns.turns,
        columns.openedAt,
        columns.turnNumber,
        columns.phase,
        columns.winner,
        columns.loser,
        match.id,
      ],
    );
  }

  async placeStake(
    matchId: number,
    accountId: number,
    heroId: number,
    amount: number,
  ): Promise<Stake> {
    return this.dataSource.transaction((manager) =>
      placeStakeIn(
        (sql, params) => manager.query(sql, params),
        matchId,
        accountId,
        heroId,
        amount,
      ),
    );
  }

  async settle(matchId: number): Promise<RewardsPaid | null> {
    return this.dataSource.transaction((manager) =>
      settleIn((sql, params) => manager.query(sql, params), matchId),
    );
  }

  async findStatistics(id?: number): Promise<Array<Record<string, unknown>>> {
    if (id !== undefined) {
      const query = `
        WITH win_table AS (
          SELECT COUNT(id) AS lose_num, loser, winner
          FROM house_matches
          WHERE loser = ?
          GROUP BY winner
        ),
        lose_table AS (
          SELECT COUNT(id) AS win_num, loser, winner
          FROM house_matches
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

    const query = `
      WITH win_table AS (
        SELECT COUNT(id) AS win, winner FROM house_matches GROUP BY winner ORDER BY win
      ),
      lose_table AS (
        SELECT COUNT(id) AS lose, loser FROM house_matches GROUP BY loser ORDER BY lose
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
}
