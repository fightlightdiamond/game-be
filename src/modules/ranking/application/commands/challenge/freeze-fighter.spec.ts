import { Hero } from '../../../../hero-catalog/domain/hero';
import { HeroStats } from '../../../../hero-catalog/domain/value-objects/hero-stats.vo';
import { freezeOwned } from './freeze-fighter';

describe('freezeOwned', () => {
  it('uses the catalog hero name and the stats the owned row does not store', () => {
    const hero = new Hero(
      4,
      'Fenrir',
      'fire',
      'front',
      '',
      '',
      null,
      new HeroStats(10000, 1000, 200, 100, 20, 170, 0, 0, 12, 100, 0, 2, 3),
    );

    const fighter = freezeOwned(
      80,
      { hp: 12000, atk: 1500, def: 240, spd: 110, critRate: 25 },
      hero,
    );

    expect(fighter.id).toBe(80);
    expect(fighter.name).toBe('Fenrir');
    expect(fighter.currentHp).toBe(12000);
    expect(fighter.currentAtk).toBe(1500);
    expect(fighter.critDmg).toBe(170);
    expect(fighter.dodge).toBe(12);
    expect(fighter.effectResistance).toBe(2);
    expect(fighter.intrinsicStatus).toBe(3);
  });
});
