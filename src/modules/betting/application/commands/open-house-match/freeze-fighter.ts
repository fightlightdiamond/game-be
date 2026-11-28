import { Fighter } from '../../../../combat/domain/fighter';
import { Hero } from '../../../../hero-catalog/domain/hero';

export function freeze(hero: Hero): Fighter {
  return new Fighter(
    hero.id,
    hero.name,
    hero.stats.hp,
    hero.stats.hp,
    hero.stats.atk,
    hero.stats.atk,
    hero.stats.def,
    hero.stats.def,
    hero.stats.spd,
    hero.stats.critRate,
    hero.stats.critDmg,
    hero.stats.dodge,
    hero.stats.effectResistance,
    hero.stats.intrinsicStatus,
  );
}
