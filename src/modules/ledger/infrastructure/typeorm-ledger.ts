import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ledger } from '../domain/ledger';
import {
  InsufficientBalanceException,
  MissingBalanceException,
} from '../domain/insufficient-balance.exception';

const DEBIT_BALANCE_SQL =
  'UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?';
const CREDIT_BALANCE_SQL =
  'UPDATE accounts SET balance = balance + ? WHERE id = ?';

export type BalanceSql = (
  statement: string,
  params?: unknown[],
) => Promise<unknown>;

export function affectedRows(raw: unknown): number {
  if (raw && typeof raw === 'object' && 'affectedRows' in raw) {
    return Number((raw as { affectedRows: number }).affectedRows);
  }
  return 0;
}

/** Debit on the caller's connection so a stake and the money commit together. */
export async function debitBalance(
  sql: BalanceSql,
  accountId: number,
  amount: number,
): Promise<void> {
  const raw = await sql(DEBIT_BALANCE_SQL, [amount, accountId, amount]);
  if (affectedRows(raw) === 0) {
    throw new InsufficientBalanceException(accountId, amount);
  }
}

/** Credit on the caller's connection so settlement and the money commit together. */
export async function creditBalance(
  sql: BalanceSql,
  accountId: number,
  amount: number,
): Promise<void> {
  const raw = await sql(CREDIT_BALANCE_SQL, [amount, accountId]);
  if (affectedRows(raw) === 0) {
    throw new MissingBalanceException(accountId);
  }
}

@Injectable()
export class TypeOrmLedger implements Ledger {
  constructor(private readonly dataSource: DataSource) {}

  async debit(accountId: number, amount: number): Promise<void> {
    await debitBalance(
      (statement, params) => this.dataSource.query(statement, params),
      accountId,
      amount,
    );
  }

  async credit(accountId: number, amount: number): Promise<void> {
    await creditBalance(
      (statement, params) => this.dataSource.query(statement, params),
      accountId,
      amount,
    );
  }
}
