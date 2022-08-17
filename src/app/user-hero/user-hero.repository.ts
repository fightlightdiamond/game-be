import { Repository } from 'typeorm';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { UserHeroEntity } from '../../migrations/entities/user-hero.entity';

@CustomRepository(UserHeroEntity)
export class UserHeroRepository extends Repository<UserHeroEntity> {}
