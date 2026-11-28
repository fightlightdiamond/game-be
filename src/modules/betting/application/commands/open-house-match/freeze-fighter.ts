import { Fighter } from '../../../../combat/domain/fighter';
import { PublishedHero } from '../../../../hero-catalog/application/published-hero';

export function freeze(hero: PublishedHero): Fighter {
  return new Fighter(
    hero.id,
    hero.name,
    hero.hp,
    hero.hp,
    hero.atk,
    hero.atk,
    hero.def,
    hero.def,
    hero.spd,
    hero.critRate,
    hero.critDmg,
    hero.dodge,
    hero.effectResistance,
    hero.intrinsicStatus,
  );
}
