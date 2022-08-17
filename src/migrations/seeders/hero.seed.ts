import { factory, Seeder } from 'typeorm-seeding';
import { HeroEntity } from '../entities/hero.entity';
import { heroesName } from '../../common/utils/hero.util';

export class HeroSeed implements Seeder {
  public async run(): Promise<void> {
    heroesName.map((name) => {
      return factory(HeroEntity)().create({ name });
    });
  }
}
