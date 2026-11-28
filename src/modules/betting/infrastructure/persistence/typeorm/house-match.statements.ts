import { InsufficientBalanceException } from '../../../../ledger/domain/insufficient-balance.exception';
import {
  CREDIT_BALANCE_SQL,
  DEBIT_BALANCE_SQL,
  affectedRows,
} from '../../../../ledger/infrastructure/typeorm-ledger';
import { RewardsPaid } from '../../../domain/events/rewards-paid.event';
import {
  HouseMatchNotFoundException,
  StakeRefusedException,
} from '../../../domain/exceptions/stake-refused.exception';
import { Stake } from '../../../domain/stake';
import { winningPayouts } from '../../../domain/winning-payouts';
import { MatchRow, rowToMatch } from './house-match.mapper';
import { REVEALED_COLUMN, SETTLED_COLUMN } from './phase-column';

export type Sql = (sql: string, params?: unknown[]) => Promise<unknown>;

export async function placeStakeIn(
  sql: Sql,
  matchId: number,
  accountId: number,
  heroId: number,
  amount: number,
): Promise<Stake> {
  const locked = await sql(
    'SELECT id, hero_info, turns, start_time, turn_number, status, winner, loser FROM matches WHERE id = ? FOR UPDATE',
    [matchId],
  );
  const row = firstRow<MatchRow>(locked);
  if (!row) {
    throw new HouseMatchNotFoundException(matchId);
  }
  const match = rowToMatch({ ...row, id: matchId });
  match.placeStake(accountId, heroId, amount);

  const existing = await sql(
    'SELECT id FROM bets WHERE user_id = ? AND match_id = ? LIMIT 1',
    [accountId, matchId],
  );
  if (firstRow(existing)) {
    throw new StakeRefusedException(
      'An account places one stake on a house match',
    );
  }

  const debited = await sql(DEBIT_BALANCE_SQL, [amount, accountId, amount]);
  if (affectedRows(debited) === 0) {
    throw new InsufficientBalanceException(accountId, amount);
  }

  const inserted = await sql(
    'INSERT INTO bets (user_id, match_id, hero_id, balance, result) VALUES (?, ?, ?, ?, ?)',
    [accountId, matchId, heroId, amount, 0],
  );
  return new Stake(insertId(inserted), accountId, matchId, heroId, amount);
}

export async function settleIn(
  sql: Sql,
  matchId: number,
): Promise<RewardsPaid | null> {
  const updated = await sql(
    'UPDATE matches SET status = ? WHERE id = ? AND status = ?',
    [SETTLED_COLUMN, matchId, REVEALED_COLUMN],
  );
  if (affectedRows(updated) === 0) {
    return null;
  }

  const matchRows = await sql('SELECT winner FROM matches WHERE id = ?', [
    matchId,
  ]);
  const match = firstRow<{ winner: number }>(matchRows);
  const winnerId = Number(match?.winner ?? 0);
  const stakeRows = await sql(
    'SELECT user_id, hero_id, balance FROM bets WHERE match_id = ?',
    [matchId],
  );
  const stakes = rowsOf<{
    user_id: number;
    hero_id: number;
    balance: number;
  }>(stakeRows).map(
    (row, index) =>
      new Stake(
        index + 1,
        Number(row.user_id),
        matchId,
        Number(row.hero_id),
        Number(row.balance),
      ),
  );
  const payouts = winningPayouts(stakes, winnerId);
  for (const payout of payouts) {
    const credited = await sql(CREDIT_BALANCE_SQL, [
      payout.payout,
      payout.accountId,
    ]);
    if (affectedRows(credited) === 0) {
      throw new Error(`No balance for account ${payout.accountId}`);
    }
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
