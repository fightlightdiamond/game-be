import { Repository } from 'typeorm';
import { AuthTokenEntity } from './auth-token.entity';
import { CustomRepository } from '../../../core/typeorm/typeorm.decorator';

@CustomRepository(AuthTokenEntity)
export class AuthTokenRepository extends Repository<AuthTokenEntity> {}
