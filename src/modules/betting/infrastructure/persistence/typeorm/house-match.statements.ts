import {
  affectedRows,
  creditBalance,
  debitBalance,
} from '../../../../ledger/infrastructure/typeorm-ledger';
import { RewardsPaid } from '../../../domain/events/rewards-paid.event';
import {
  HouseMatchNotFoundException,
  StakeRefusedException,
} from '../../../domain/exceptions/stake-refused.exception';
import { Phase } from '../../../domain/phase';
import { Stake } from '../../../domain/stake';
import { winningPayouts } from '../../../domain/winning-payouts';
import { MatchRow, rowToMatch } from './house-match.mapper';

export type Sql = (sql: string, params?: unknown[]) => Promise<unknown>;

export async function placeStakeIn(
  sql: Sql,
  matchId: number,
  accountId: number,
  heroId: number,
  amount: number,
): Promise<Stake> {
  const locked = await sql(
    'SELECT id, hero_info, turns, start_time, turn_number, phase, winner, loser FROM house_matches WHERE id = ? FOR UPDATE',
    [matchId],
  );
  const row = firstRow<MatchRow>(locked);
  if (!row) {
    throw new HouseMatchNotFoundException(matchId);
  }
  const match = rowToMatch({ ...row, id: matchId });
  match.placeStake(accountId, heroId, amount);

  const existing = await sql(
    'SELECT id FROM stakes WHERE account_id = ? AND house_match_id = ? LIMIT 1',
    [accountId, matchId],
  );
  if (firstRow(existing)) {
    throw new StakeRefusedException(
      'An account places one stake on a house match',
    );
  }

  await debitBalance(sql, accountId, amount);

  const inserted = await sql(
    'INSERT INTO stakes (account_id, house_match_id, hero_id, amount, result) VALUES (?, ?, ?, ?, ?)',
    [accountId, matchId, heroId, amount, 0],
  );
  return new Stake(insertId(inserted), accountId, matchId, heroId, amount);
}

export async function settleIn(
  sql: Sql,
  matchId: number,
): Promise<RewardsPaid | null> {
  const updated = await sql(
    'UPDATE house_matches SET phase = ? WHERE id = ? AND phase = ?',
    [Phase.Settled, matchId, Phase.Revealed],
  );
  if (affectedRows(updated) === 0) {
    return null;
  }

  const matchRows = await sql('SELECT winner FROM house_matches WHERE id = ?', [
    matchId,
  ]);
  const match = firstRow<{ winner: number }>(matchRows);
  const winnerId = Number(match?.winner ?? 0);
  const stakeRows = await sql(
    'SELECT account_id, hero_id, amount FROM stakes WHERE house_match_id = ?',
    [matchId],
  );
  const stakes = rowsOf<{
    account_id: number;
    hero_id: number;
    amount: number;
  }>(stakeRows).map(
    (row, index) =>
      new Stake(
        index + 1,
        Number(row.account_id),
        matchId,
        Number(row.hero_id),
        Number(row.amount),
      ),
  );
  const payouts = winningPayouts(stakes, winnerId);
  for (const payout of payouts) {
    await creditBalance(sql, payout.accountId, payout.payout);
  }
  return new RewardsPaid(matchId, payouts);
}

function firstRow<T>(raw: unknown): T | undefined {
  return rowsOf<T>(raw)[0];
}

function rowsOf<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function insertId(raw: unknown): number {
  if (raw && typeof raw === 'object' && 'insertId' in raw) {
    return Number((raw as { insertId: number }).insertId);
  }
  return 0;
}
