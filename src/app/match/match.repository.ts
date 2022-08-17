import { Repository } from 'typeorm';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { MatchEntity } from '../../migrations/entities/match.entity';

@CustomRepository(MatchEntity)
export class MatchRepository extends Repository<MatchEntity> {}
