import { Repository } from 'typeorm';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { EloMatchEntity } from '../../migrations/entities/elo-match.entity';

@CustomRepository(EloMatchEntity)
export class EloMatchRepository extends Repository<EloMatchEntity> {}
