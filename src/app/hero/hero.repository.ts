import { Repository } from 'typeorm';
import { HeroEntity } from '../../migrations/entities/hero.entity';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';

@CustomRepository(HeroEntity)
export class HeroRepository extends Repository<HeroEntity> {
  /**
   * Get Pair Heroes
   */
  async getPairHeroes() {
    return this.createQueryBuilder()
      .select([
        'id',
        'name',
        'atk',
        'hp',
        'def',
        'dodge',
        'crit_rate',
        'crit_dmg',
        'spd',
      ])
      .orderBy('RAND()')
      .limit(2)
      .execute();
  }

  /**
   * GET IDS
   */
  async getIds() {
    return this.find({
      select: ['id'],
    });
  }
}
