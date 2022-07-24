import { Factory, Seeder } from 'typeorm-seeding';
import { HeroEntity } from '../../app/hero/hero.entity';

export class HeroSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(HeroEntity)().createMany(2);
  }
}
