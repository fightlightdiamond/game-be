import { PublishedHero } from '../../../../hero-catalog/application/published-hero';
import { freezeOwned } from './freeze-fighter';

describe('freezeOwned', () => {
  it('uses the catalog hero name and the stats the owned row does not store', () => {
    const hero: PublishedHero = {
      id: 4,
      name: 'Fenrir',
      element: 'fire',
      position: 'front',
      hp: 10000,
      atk: 1000,
      def: 200,
      spd: 100,
      critRate: 20,
      critDmg: 170,
      dodge: 12,
      effectResistance: 2,
      intrinsicStatus: 3,
    };

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
