import { OwnedHero } from '../../../domain/owned-hero';
import { UserHeroOrmEntity } from './user-hero.orm-entity';

export function toOwnedColumns(hero: OwnedHero): UserHeroOrmEntity {
  const row = new UserHeroOrmEntity();
  if (hero.id) {
    row.id = hero.id;
  }
  row.user_id = hero.accountId;
  row.hero_id = hero.heroId;
  row.level = hero.level;
  row.atk_point = hero.atkPoint;
  row.def_point = hero.defPoint;
  row.hp_point = hero.hpPoint;
  row.spd_point = hero.spdPoint;
  row.crit_rate_point = hero.critRatePoint;
  row.elo = hero.elo;
  row.atk = hero.atk;
  row.def = hero.def;
  row.hp = hero.hp;
  row.spd = hero.spd;
  row.crit_rate = hero.critRate;
  return row;
}

export function rowToOwned(row: UserHeroOrmEntity): OwnedHero {
  return OwnedHero.reconstitute(
    row.id,
    row.user_id,
    row.hero_id,
    row.level,
    row.atk_point,
    row.def_point,
    row.hp_point,
    row.spd_point,
    row.crit_rate_point,
    row.elo,
    row.atk,
    row.def,
    row.hp,
    row.spd,
    row.crit_rate,
  );
}
