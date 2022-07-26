import { Repository } from 'typeorm';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { HeroEntity } from './hero.entity';

@CustomRepository(HeroEntity)
export class HeroRepository extends Repository<HeroEntity> {}
