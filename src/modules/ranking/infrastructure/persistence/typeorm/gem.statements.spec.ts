import { GemType } from '../../../domain/gem';
import { addLevelOneIn, levelUpGemIn, Sql } from './gem.statements';

type GemRow = {
  id: number;
  account_id: number;
  type: string;
  level: number;
  available_num: number;
};

class Gems {
  rows: GemRow[] = [];
  private nextId = 1;

  query: Sql = (sql, params = []) => Promise.resolve(this.read(sql, params));

  private read(sql: string, params: unknown[]): unknown {
    if (sql.startsWith('SELECT id, available_num')) {
      const [accountId, type, level] = [
        params[0],
        params[1],
        Number(params[2]),
      ];
      return this.rows.filter(
        (row) =>
          row.account_id === accountId &&
          row.type === type &&
          row.level === level,
      );
    }
    if (sql.startsWith('SELECT id FROM gems')) {
      const [accountId, type, level] = [
        params[0],
        params[1],
        Number(params[2]),
      ];
      return this.rows.filter(
        (row) =>
          row.account_id === accountId &&
          row.type === type &&
          row.level === level,
      );
    }
    if (sql.startsWith('UPDATE gems SET available_num = available_num + 1')) {
      const row = this.rows.find((item) => item.id === Number(params[0]));
      row.available_num += 1;
      return { affectedRows: 1 };
    }
    if (sql.startsWith('UPDATE gems SET available_num = ?')) {
      const row = this.rows.find((item) => item.id === Number(params[1]));
      row.available_num = Number(params[0]);
      return { affectedRows: 1 };
    }
    if (sql.startsWith('INSERT INTO gems')) {
      const [accountId, type, level, available] = params;
      this.rows.push({
        id: this.nextId++,
        account_id: Number(accountId),
        type: String(type),
        level: Number(level),
        available_num: Number(available),
      });
      return { insertId: this.nextId - 1 };
    }
    throw new Error(sql);
  }
}

describe('gem storage', () => {
  it('increases the level-1 count by one', async () => {
    const gems = new Gems();
    await addLevelOneIn(gems.query, 3, 'HP');
    await addLevelOneIn(gems.query, 3, 'HP');

    expect(gems.rows).toEqual([
      expect.objectContaining({
        account_id: 3,
        type: 'HP',
        level: 1,
        available_num: 2,
      }),
    ]);
  });

  it('removes spent gems and adds the next level only on success', async () => {
    const gems = new Gems();
    gems.rows.push({
      id: 1,
      account_id: 3,
      type: 'ATK',
      level: 1,
      available_num: 10,
    });

    await levelUpGemIn(gems.query, 3, 'ATK' as GemType, 1, 5, 51);
    expect(gems.rows).toEqual([
      expect.objectContaining({ level: 1, available_num: 5 }),
    ]);

    await levelUpGemIn(gems.query, 3, 'ATK', 1, 5, 50);
    expect(gems.rows).toEqual([
      expect.objectContaining({ level: 1, available_num: 0 }),
      expect.objectContaining({ level: 2, available_num: 1 }),
    ]);
  });
});
