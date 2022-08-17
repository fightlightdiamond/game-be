import { Factory, Seeder } from 'typeorm-seeding';
import { UserEntity } from '../entities/user.entity';

export class UserSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(UserEntity)().create();
  }
}
