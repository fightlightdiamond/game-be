import { DataSource } from 'typeorm';
import { TypeOrmLedger } from './typeorm-ledger';

type UserRow = {
  id: number;
  balance: number;
  email: string;
  firstName: string;
  avatar: string;
};

/**
 * Applies the statement the ledger sends. Each call finishes before the next
 * starts, which is the row lock MySQL takes for one UPDATE.
 */
class UsersTable {
  calls: string[] = [];
  private tail: Promise<unknown> = Promise.resolve();

  constructor(readonly rows: UserRow[]) {}

  query = (
    sql: string,
    params: number[],
  ): Promise<{ affectedRows: number }> => {
    const run = this.tail.then(() => this.apply(sql, params));
    this.tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };

  private apply(sql: string, params: number[]): { affectedRows: number } {
    this.calls.push(sql);
    for (const column of [
      'email',
      'avatar',
      'firstName',
      'lastName',
      'password',
    ]) {
      if (sql.includes(column)) {
        throw new Error(`ledger write mentions ${column}`);
      }
    }
    if (!sql.startsWith('UPDATE accounts SET balance = balance')) {
      throw new Error(sql);
    }

    if (sql.includes('balance >= ?')) {
      const [amount, accountId, guard] = params;
      const row = this.rows.find((item) => item.id === accountId);
      if (!row || row.balance < amount || amount !== guard) {
        return { affectedRows: 0 };
      }
      row.balance -= amount;
      return { affectedRows: 1 };
    }

    const [amount, accountId] = params;
    const row = this.rows.find((item) => item.id === accountId);
    if (!row) {
      return { affectedRows: 0 };
    }
    row.balance += amount;
    return { affectedRows: 1 };
  }
}

function ledgerFor(table: UsersTable): TypeOrmLedger {
  return new TypeOrmLedger({ query: table.query } as unknown as DataSource);
}

describe('TypeOrmLedger', () => {
  it('lets one of two concurrent debits through and leaves the balance non-negative', async () => {
    const table = new UsersTable([
      {
        id: 1,
        balance: 100,
        email: 'a@b.c',
        firstName: 'An',
        avatar: 'pic',
      },
    ]);
    const ledger = ledgerFor(table);

    const results = await Promise.allSettled([
      ledger.debit(1, 60),
      ledger.debit(1, 60),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1);
    expect(table.rows[0].balance).toBe(40);
    expect(table.calls).toEqual([
      'UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?',
      'UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?',
    ]);
  });

  it('writes balance only, so a credit leaves profile columns unchanged', async () => {
    const table = new UsersTable([
      {
        id: 1,
        balance: 40,
        email: 'a@b.c',
        firstName: 'An',
        avatar: 'pic',
      },
    ]);
    const ledger = ledgerFor(table);

    await ledger.credit(1, 25);

    expect(table.rows[0]).toEqual({
      id: 1,
      balance: 65,
      email: 'a@b.c',
      firstName: 'An',
      avatar: 'pic',
    });
    expect(table.calls).toEqual([
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
    ]);
  });

  it('changes no row when the debit is greater than the balance', async () => {
    const table = new UsersTable([
      {
        id: 1,
        balance: 10,
        email: 'a@b.c',
        firstName: 'An',
        avatar: 'pic',
      },
    ]);
    const ledger = ledgerFor(table);

    await expect(ledger.debit(1, 11)).rejects.toThrow(
      'Insufficient balance for account 1: 11',
    );
    expect(table.rows[0].balance).toBe(10);
    expect(table.calls).toHaveLength(1);
  });
});
