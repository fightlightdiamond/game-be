import { GemType, levelUpGem } from '../../../domain/gem';

export type Sql = (sql: string, params?: unknown[]) => Promise<unknown>;

export async function addLevelOneIn(
  sql: Sql,
  accountId: number,
  type: GemType,
): Promise<void> {
  const existing = await sql(
    'SELECT id, available_num FROM gems WHERE account_id = ? AND type = ? AND level = ? FOR UPDATE',
    [accountId, type, 1],
  );
  const row = firstRow<{ id: number }>(existing);
  if (row) {
    await sql(
      'UPDATE gems SET available_num = available_num + 1 WHERE id = ?',
      [row.id],
    );
    return;
  }
  await sql(
    'INSERT INTO gems (account_id, type, level, available_num) VALUES (?, ?, ?, ?)',
    [accountId, type, 1, 1],
  );
}

export async function levelUpGemIn(
  sql: Sql,
  accountId: number,
  type: GemType,
  level: number,
  spent: number,
  roll: number,
): Promise<{ gained: boolean }> {
  const existing = await sql(
    'SELECT id, available_num FROM gems WHERE account_id = ? AND type = ? AND level = ? FOR UPDATE',
    [accountId, type, level],
  );
  const row = firstRow<{ id: number; available_num: number }>(existing);
  if (!row) {
    throw new Error('Not enough gems in storage');
  }
  const next = levelUpGem(Number(row.available_num), spent, roll);
  await sql('UPDATE gems SET available_num = ? WHERE id = ?', [
    next.available,
    row.id,
  ]);
  if (!next.gained) {
    return { gained: false };
  }

  const higher = await sql(
    'SELECT id FROM gems WHERE account_id = ? AND type = ? AND level = ? FOR UPDATE',
    [accountId, type, level + 1],
  );
  const higherRow = firstRow<{ id: number }>(higher);
  if (higherRow) {
    await sql(
      'UPDATE gems SET available_num = available_num + 1 WHERE id = ?',
      [higherRow.id],
    );
  } else {
    await sql(
      'INSERT INTO gems (account_id, type, level, available_num) VALUES (?, ?, ?, ?)',
      [accountId, type, level + 1, 1],
    );
  }
  return { gained: true };
}

function firstRow<T>(raw: unknown): T | undefined {
  return Array.isArray(raw) ? (raw as T[])[0] : undefined;
}
