import { Repository } from 'typeorm';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { BetEntity } from '../../migrations/entities/bet.entity';

@CustomRepository(BetEntity)
export class BetRepository extends Repository<BetEntity> {}
