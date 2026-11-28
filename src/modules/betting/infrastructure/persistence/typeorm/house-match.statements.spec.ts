import { InsufficientBalanceException } from '../../../../ledger/domain/insufficient-balance.exception';
import { HouseMatch } from '../../../domain/house-match';
import { StakeRefusedException } from '../../../domain/exceptions/stake-refused.exception';
import { toMatchColumns } from './house-match.mapper';
import { placeStakeIn, settleIn, Sql } from './house-match.statements';
import { OPEN_COLUMN, REVEALED_COLUMN } from './phase-column';

type UserRow = { id: number; balance: number; email: string };
type MatchRecord = {
  id: number;
  status: number;
  winner: number;
  loser: number;
  hero_info: string;
  turns: string;
  start_time: string;
  turn_number: number;
};
type BetRow = {
  user_id: number;
  match_id: number;
  hero_id: number;
  balance: number;
};

class Table {
  users: UserRow[] = [{ id: 3, balance: 100, email: 'a@b.c' }];
  matches: MatchRecord[] = [];
  bets: BetRow[] = [];
  credits = 0;

  query: Sql = (sql, params = []) => Promise.resolve(this.read(sql, params));

  private read(sql: string, params: unknown[] = []): unknown {
    if (sql.startsWith('SELECT id, hero_info')) {
      const id = Number(params[0]);
      return this.matches.filter((match) => match.id === id);
    }
    if (sql.startsWith('SELECT id FROM bets')) {
      const [accountId, matchId] = params.map(Number);
      return this.bets.filter(
        (bet) => bet.user_id === accountId && bet.match_id === matchId,
      );
    }
    if (sql.includes('balance = balance -')) {
      const [amount, accountId, guard] = params.map(Number);
      const user = this.users.find((row) => row.id === accountId);
      if (!user || user.balance < amount || amount !== guard) {
        return { affectedRows: 0 };
      }
      user.balance -= amount;
      return { affectedRows: 1 };
    }
    if (sql.startsWith('INSERT INTO bets')) {
      const [accountId, matchId, heroId, amount] = params.map(Number);
      this.bets.push({
        user_id: accountId,
        match_id: matchId,
        hero_id: heroId,
        balance: amount,
      });
      return { insertId: this.bets.length };
    }
    if (sql.startsWith('UPDATE matches SET status')) {
      const [next, id, current] = params.map(Number);
      const match = this.matches.find((row) => row.id === id);
      if (!match || match.status !== current) {
        return { affectedRows: 0 };
      }
      match.status = next;
      return { affectedRows: 1 };
    }
    if (sql.startsWith('SELECT winner')) {
      const id = Number(params[0]);
      return this.matches
        .filter((match) => match.id === id)
        .map((match) => ({ winner: match.winner }));
    }
    if (sql.startsWith('SELECT user_id')) {
      const matchId = Number(params[0]);
      return this.bets.filter((bet) => bet.match_id === matchId);
    }
    if (sql.includes('balance = balance +')) {
      const [amount, accountId] = params.map(Number);
      const user = this.users.find((row) => row.id === accountId);
      if (!user) {
        return { affectedRows: 0 };
      }
      user.balance += amount;
      this.credits += 1;
      return { affectedRows: 1 };
    }
    throw new Error(sql);
  }
}

function openRow(): MatchRecord {
  const match = HouseMatch.open(
    [
      { id: 4, name: 'Fenrir', element: 'fire', position: 'front' },
      { id: 9, name: 'Hell', element: 'dark', position: 'back' },
    ],
    { winnerId: 9, loserId: 4, turns: [{ turnNumber: 1 }], turnNumber: 2 },
    '1000',
  );
  const columns = toMatchColumns(match);
  return {
    id: 7,
    status: columns.status,
    winner: columns.winner,
    loser: columns.loser,
    hero_info: columns.heroInfo,
    turns: columns.turns,
    start_time: columns.openedAt,
    turn_number: columns.turnNumber,
  };
}

describe('house match persistence', () => {
  it('writes the stored winner while the match is still Open', () => {
    const columns = toMatchColumns(
      HouseMatch.open(
        [
          { id: 4, name: 'Fenrir', element: 'fire', position: 'front' },
          { id: 9, name: 'Hell', element: 'dark', position: 'back' },
        ],
        { winnerId: 9, loserId: 4, turns: [{ turnNumber: 1 }], turnNumber: 2 },
        '1000',
      ),
    );

    expect(columns.status).toBe(OPEN_COLUMN);
    expect(columns.winner).toBe(9);
    expect(JSON.parse(columns.turns)).toEqual([{ turnNumber: 1 }]);
  });

  it('refuses a stake during Revealed and leaves the balance unchanged', async () => {
    const table = new Table();
    const row = openRow();
    row.status = REVEALED_COLUMN;
    table.matches.push(row);

    await expect(placeStakeIn(table.query, 7, 3, 9, 10)).rejects.toBeInstanceOf(
      StakeRefusedException,
    );
    expect(table.users[0].balance).toBe(100);
    expect(table.users[0].email).toBe('a@b.c');
    expect(table.bets).toHaveLength(0);
  });

  it('rolls the debit back in the statement order when the balance is too small', async () => {
    const table = new Table();
    table.users[0].balance = 5;
    table.matches.push(openRow());

    await expect(placeStakeIn(table.query, 7, 3, 9, 10)).rejects.toBeInstanceOf(
      InsufficientBalanceException,
    );
    expect(table.bets).toHaveLength(0);
    expect(table.users[0].balance).toBe(5);
  });

  it('credits a winning stake once when settle is replayed', async () => {
    const table = new Table();
    const row = openRow();
    row.status = REVEALED_COLUMN;
    table.matches.push(row);
    table.bets.push({ user_id: 3, match_id: 7, hero_id: 9, balance: 10 });

    const first = await settleIn(table.query, 7);
    const second = await settleIn(table.query, 7);

    expect(first.payouts).toEqual([
      { accountId: 3, stakeAmount: 10, payout: 20 },
    ]);
    expect(second).toBeNull();
    expect(table.credits).toBe(1);
    expect(table.users[0].balance).toBe(120);
    expect(table.matches[0].status).toBe(3);
  });
});
