import { Fighter } from '../../../../combat/domain/fighter';
import { PublishedHero } from '../../../../hero-catalog/application/published-hero';

type OwnedStats = {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
};

/**
 * The fight id stays the owned hero, so the result still names that hero.
 * The name and the stats the owned row does not store come from the catalog.
 */
export function freezeOwned(
  ownedId: number,
  owned: OwnedStats,
  hero: PublishedHero,
): Fighter {
  return new Fighter(
    ownedId,
    hero.name,
    owned.hp,
    owned.hp,
    owned.atk,
    owned.atk,
    owned.def,
    owned.def,
    owned.spd,
    owned.critRate,
    hero.critDmg,
    hero.dodge,
    hero.effectResistance,
    hero.intrinsicStatus,
  );
}
