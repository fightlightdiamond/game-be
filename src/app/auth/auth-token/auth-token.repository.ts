import { Repository } from 'typeorm';
import { CustomRepository } from '../../../core/typeorm/typeorm.decorator';
import { AuthTokenEntity } from './auth-token.entity';

@CustomRepository(AuthTokenEntity)
export class AuthTokenRepository extends Repository<AuthTokenEntity> {}
