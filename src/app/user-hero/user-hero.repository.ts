import { Repository } from 'typeorm';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { UserHeroEntity } from '../../migrations/entities/user-hero.entity';

@CustomRepository(UserHeroEntity)
export class UserHeroRepository extends Repository<UserHeroEntity> {
  async geHeroByUser(user_id: number) {
    return this.findOne({
      where: { user_id },
    });
  }
}
