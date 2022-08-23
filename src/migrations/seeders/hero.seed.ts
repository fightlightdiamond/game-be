import { factory, Seeder } from 'typeorm-seeding';
import { HeroEntity } from '../entities/hero.entity';
import { heroesName } from '../../common/utils/hero.util';

export class HeroSeed implements Seeder {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(): Promise<void> {
    heroesName.map(async (name) => {
      return factory(HeroEntity)().create({ name });
    });
  }
}
