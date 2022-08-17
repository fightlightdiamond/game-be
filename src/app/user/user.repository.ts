import { Repository } from 'typeorm';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { UserEntity } from '../../migrations/entities/user.entity';

@CustomRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  async getUserByEmail(email: string): Promise<UserEntity> {
    return this.findOne({
      where: { email: email },
    });
  }
}
