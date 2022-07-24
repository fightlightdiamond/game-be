import { define } from 'typeorm-seeding';
import { randFullName, randText } from '@ngneat/falso';

import { HeroEntity } from '../../app/hero/hero.entity';

export const HeroFactory = () => {
  const u = new HeroEntity();
  u.hp = 10000;
  u.atk = 10000;
  u.name = randFullName();
  u.story = randText();
  u.guide = randText();
  return u;
};

define(HeroEntity, () => {
  return HeroFactory();
});
