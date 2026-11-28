import { Hero } from '../domain/hero';

/** Stats another context may freeze. The catalog `Hero` class stays in this context. */
export type PublishedHero = {
  id: number;
  name: string;
  element: string;
  position: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  critDmg: number;
  dodge: number;
  effectResistance: number;
  intrinsicStatus: number;
};

export function publishHero(hero: Hero): PublishedHero {
  return {
    id: hero.id,
    name: hero.name,
    element: hero.element,
    position: hero.position,
    hp: hero.stats.hp,
    atk: hero.stats.atk,
    def: hero.stats.def,
    spd: hero.stats.spd,
    critRate: hero.stats.critRate,
    critDmg: hero.stats.critDmg,
    dodge: hero.stats.dodge,
    effectResistance: hero.stats.effectResistance,
    intrinsicStatus: hero.stats.intrinsicStatus,
  };
}
