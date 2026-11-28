import { Hero } from '../../../../hero-catalog/domain/hero';
import { HeroStats } from '../../../../hero-catalog/domain/value-objects/hero-stats.vo';
import { freeze } from './freeze-fighter';

describe('freeze', () => {
  it('builds a Fighter from a catalog hero', () => {
    const hero = new Hero(
      9,
      'Hell',
      'dark',
      'back',
      '',
      '',
      null,
      new HeroStats(10000, 1000, 200, 100, 20, 150, 0, 0, 10, 100, 0, 1, 0),
    );

    const fighter = freeze(hero);

    expect(fighter.id).toBe(9);
    expect(fighter.name).toBe('Hell');
    expect(fighter.maxHp).toBe(10000);
    expect(fighter.currentHp).toBe(10000);
    expect(fighter.critDmg).toBe(150);
    expect(fighter.dodge).toBe(10);
    expect(fighter.effectResistance).toBe(1);
  });
});
