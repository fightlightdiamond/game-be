import { Repository } from 'typeorm';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { TreeEntity } from '../../migrations/entities/tree.entity';

@CustomRepository(TreeEntity)
export class TreeRepository extends Repository<TreeEntity> {}
