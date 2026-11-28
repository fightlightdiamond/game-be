import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Account } from '../../../domain/account';
import { Clock } from '../../../domain/clock';
import { RoleEnum } from '../../../domain/enums/role.enum';
import { GrantedDay } from '../../../domain/granted-day';
import { Ledger } from '../../../../ledger/domain/ledger';
import { AccountRepository } from '../../../domain/repositories/account.repository';
import { PasswordHasher } from '../../../infrastructure/auth/password-hasher';
import { OpenBalance } from '../../../infrastructure/open-balance';
import { LoginCommand } from './login.command';
import { LoginHandler } from './login.handler';

const day = new Date('2026-11-28T04:00:00.000Z');

function account(): Account {
  return new Account(4, 'a@b.c', 'hash', RoleEnum.USER, true, null);
}

class Days implements GrantedDay {
  value: string | null = null;

  async claim(_accountId: number, today: string): Promise<boolean> {
    if (this.value === today) {
      return Promise.resolve(false);
    }
    this.value = today;
    return Promise.resolve(true);
  }

  async release(_accountId: number, today: string): Promise<void> {
    if (this.value === today) {
      this.value = null;
    }
    return Promise.resolve();
  }
}

describe('LoginHandler', () => {
  const clock: Clock = { now: () => day };
  const accounts: AccountRepository = {
    findById: () => Promise.resolve(account()),
    findByEmail: () => Promise.resolve(account()),
    save: (saved) => Promise.resolve(saved),
  };
  const hasher = {
    compare: () => Promise.resolve(true),
    hash: () => Promise.resolve('hash'),
  } as unknown as PasswordHasher;
  const jwt = {
    signAsync: () => Promise.resolve('token'),
  } as unknown as JwtService;
  const config = { get: () => 'secret' } as unknown as ConfigService;

  function handler(days: Days, credits: number[]) {
    const ledger: Ledger = {
      debit: () => Promise.resolve(),
      credit: (_id, amount) => {
        credits.push(amount);
        return Promise.resolve();
      },
    };
    const balances = {
      openIfMissing: () => Promise.resolve(),
    } as unknown as OpenBalance;
    return new LoginHandler(
      accounts,
      hasher,
      jwt,
      config,
      clock,
      days,
      ledger,
      balances,
    );
  }

  it('credits 100 on the first login of the day and not on the second', async () => {
    const days = new Days();
    const credits: number[] = [];
    const login = handler(days, credits);

    await login.execute(new LoginCommand('a@b.c', 'secret'));
    await login.execute(new LoginCommand('a@b.c', 'secret'));

    expect(credits).toEqual([100]);
  });

  it('does not keep the day when the credit fails', async () => {
    const days = new Days();
    const ledger: Ledger = {
      debit: () => Promise.resolve(),
      credit: () => Promise.reject(new Error('down')),
    };
    const balances = {
      openIfMissing: () => Promise.resolve(),
    } as unknown as OpenBalance;
    const login = new LoginHandler(
      accounts,
      hasher,
      jwt,
      config,
      clock,
      days,
      ledger,
      balances,
    );

    await expect(
      login.execute(new LoginCommand('a@b.c', 'secret')),
    ).rejects.toThrow('down');
    expect(days.value).toBeNull();
  });
});
