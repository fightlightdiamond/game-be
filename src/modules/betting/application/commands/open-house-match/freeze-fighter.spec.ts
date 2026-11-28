import { PublishedHero } from '../../../../hero-catalog/application/published-hero';
import { freeze } from './freeze-fighter';

describe('freeze', () => {
  it('builds a Fighter from published catalog stats', () => {
    const hero: PublishedHero = {
      id: 9,
      name: 'Hell',
      element: 'dark',
      position: 'back',
      hp: 10000,
      atk: 1000,
      def: 200,
      spd: 100,
      critRate: 20,
      critDmg: 150,
      dodge: 10,
      effectResistance: 1,
      intrinsicStatus: 0,
    };

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
