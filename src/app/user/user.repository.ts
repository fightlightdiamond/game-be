import { UserEntity } from './user.entity';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { Repository } from 'typeorm';

@CustomRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  async getUserByEmail(email: string): Promise<UserEntity> {
    return this.findOne({
      where: { email: email },
    });
  }
}
