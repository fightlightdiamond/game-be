import { Factory, Seeder } from 'typeorm-seeding';
import { randNumber } from '@ngneat/falso';
import { UserEntity } from '../entities/user.entity';
import { UserHeroEntity } from '../entities/user-hero.entity';
import { HeroEntity } from '../entities/hero.entity';

export class UserSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    const users = await factory(UserEntity)().createMany(32);

    const heroes = await HeroEntity.find();

    for (const user of users) {
      const userHero = new UserHeroEntity();
      const idR = randNumber({ min: 1, max: 8 });
      const hero = heroes[idR];
      userHero.hero_id = idR;
      userHero.user_id = user.id;
      delete hero.id;
      delete hero.createdAt;
      delete hero.updatedAt;

      for (const [key, value] of Object.entries(hero)) {
        userHero[key] = value;
      }
      await userHero.save();
    }
  }
}
