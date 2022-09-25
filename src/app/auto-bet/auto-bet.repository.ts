import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomRepository } from '../../core/typeorm/typeorm.decorator';
import { AutoBetEntity } from '../../migrations/entities/auto-bet.entity';

@CustomRepository(AutoBetEntity)
@Injectable()
export class AutoBetRepository extends Repository<AutoBetEntity> {
  /**
   * get Enable By Pair
   * @param rival_pair
   */
  public async getEnableByPair(rival_pair: string) {
    return this.createQueryBuilder('a')
      .leftJoin('a.user', 'user')
      .where({
        rival_pair,
        is_enable: true,
      })
      .select(['user_id', 'rival_pair', 'is_enable', 'bet_percentage'])
      .getMany();
  }

  /**
   * update By User Id
   * @param id
   * @param is_enable
   * @param bet_percentage
   */
  public async updateByUserId(
    id: number,
    is_enable: boolean,
    bet_percentage: number,
  ) {
    return this.update(
      {
        id,
      },
      {
        is_enable,
        bet_percentage,
      },
    );
  }

  /**
   * get By User
   * @param user_id
   */
  public async getByUser(user_id: number) {
    return this.find({
      where: { user_id },
    });
  }
}
