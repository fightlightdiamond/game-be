import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ledger } from '../domain/ledger';
import {
  InsufficientBalanceException,
  MissingBalanceException,
} from '../domain/insufficient-balance.exception';

export const DEBIT_BALANCE_SQL =
  'UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?';
export const CREDIT_BALANCE_SQL =
  'UPDATE users SET balance = balance + ? WHERE id = ?';

@Injectable()
export class TypeOrmLedger implements Ledger {
  constructor(private readonly dataSource: DataSource) {}

  async debit(accountId: number, amount: number): Promise<void> {
    const raw = await this.dataSource.query(DEBIT_BALANCE_SQL, [
      amount,
      accountId,
      amount,
    ]);
    if (affectedRows(raw) === 0) {
      throw new InsufficientBalanceException(accountId, amount);
    }
  }

  async credit(accountId: number, amount: number): Promise<void> {
    const raw = await this.dataSource.query(CREDIT_BALANCE_SQL, [
      amount,
      accountId,
    ]);
    if (affectedRows(raw) === 0) {
      throw new MissingBalanceException(accountId);
    }
  }
}

export function affectedRows(raw: unknown): number {
  if (raw && typeof raw === 'object' && 'affectedRows' in raw) {
    return Number((raw as { affectedRows: number }).affectedRows);
  }
  return 0;
}
