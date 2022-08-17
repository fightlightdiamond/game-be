import { define } from 'typeorm-seeding';
import { randFullName, randText } from '@ngneat/falso';
import { HeroEntity } from '../entities/hero.entity';

export const HeroFactory = () => {
  const u = new HeroEntity();
  u.hp = 10000;
  u.atk = 1000;
  u.def = 200;
  u.crit_rate = 20;
  u.crit_dmg = 200;
  u.spd = 200;
  u.name = randFullName();
  u.story = randText();
  u.guide = randText();
  return u;
};

define(HeroEntity, () => {
  return HeroFactory();
});
