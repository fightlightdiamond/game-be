import { Repository } from 'typeorm';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { UserGemEntity } from 'src/migrations/entities/user-gem.entity';

@CustomRepository(UserGemEntity)
export class UserGemRepository extends Repository<UserGemEntity> {}
