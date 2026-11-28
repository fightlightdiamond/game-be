import { InsufficientBalanceException } from '../../../../ledger/domain/insufficient-balance.exception';
import { Ledger } from '../../../../ledger/domain/ledger';
import { OwnedHero } from '../../../domain/owned-hero';
import { OwnedHeroRepository } from '../../../domain/repositories/owned-hero.repository';
import { toOwnedColumns } from '../../../infrastructure/persistence/typeorm/owned-hero.mapper';
import { LevelUpOwnedHeroCommand } from './level-up-owned-hero.command';
import { LevelUpOwnedHeroHandler } from './level-up-owned-hero.handler';

function heroAt(level: number): OwnedHero {
  return OwnedHero.reconstitute(
    9,
    4,
    7,
    level,
    0,
    0,
    0,
    0,
    0,
    1600,
    1000,
    200,
    10000,
    200,
    20,
  );
}

describe('LevelUpOwnedHeroHandler', () => {
  it('debits first and persists level 1 from level 0', async () => {
    const hero = heroAt(0);
    let levelWhenDebited = -1;
    const heroes: OwnedHeroRepository = {
      findById: () => Promise.resolve(hero),
      findByAccountId: () => Promise.resolve(hero),
      save: (owned) => Promise.resolve(owned),
      findLeaderboard: () => Promise.resolve([]),
    };
    const ledger: Ledger = {
      debit: (_accountId, amount) => {
        levelWhenDebited = hero.level;
        expect(amount).toBe(2);
        return Promise.resolve();
      },
      credit: () => Promise.resolve(),
    };

    const saved = await new LevelUpOwnedHeroHandler(heroes, ledger).execute(
      new LevelUpOwnedHeroCommand(9, 4),
    );

    expect(levelWhenDebited).toBe(0);
    expect(toOwnedColumns(saved).level).toBe(1);
  });

  it('leaves level 0 when the debit fails', async () => {
    const hero = heroAt(0);
    const heroes: OwnedHeroRepository = {
      findById: () => Promise.resolve(hero),
      findByAccountId: () => Promise.resolve(hero),
      save: () => Promise.reject(new Error('save should not run')),
      findLeaderboard: () => Promise.resolve([]),
    };
    const ledger: Ledger = {
      debit: () => Promise.reject(new InsufficientBalanceException(4, 2)),
      credit: () => Promise.resolve(),
    };

    await expect(
      new LevelUpOwnedHeroHandler(heroes, ledger).execute(
        new LevelUpOwnedHeroCommand(9, 4),
      ),
    ).rejects.toBeInstanceOf(InsufficientBalanceException);
    expect(hero.level).toBe(0);
  });
});
