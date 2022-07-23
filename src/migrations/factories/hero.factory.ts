import { define } from 'typeorm-seeding';
import { randFullName, randText } from '@ngneat/falso';

import { HeroesEntity } from '../../app/hero/heroes.entity';

export const HeroFactory = () => {
  const u = new HeroesEntity();
  u.hp = 10000;
  u.atk = 10000;
  u.name = randFullName();
  u.story = randText();
  u.guide = randText();
  return u;
};

define(HeroesEntity, () => {
  return HeroFactory();
});
