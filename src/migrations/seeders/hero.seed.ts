import { Factory, Seeder } from 'typeorm-seeding';
import { HeroesEntity } from '../../app/hero/heroes.entity';

export class HeroSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(HeroesEntity)().createMany(2);
  }
}
