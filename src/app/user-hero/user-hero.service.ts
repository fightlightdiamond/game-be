import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from '../user/user.repository';
import { UserEntity } from '../../migrations/entities/user.entity';
import { UserHeroEntity } from '../../migrations/entities/user-hero.entity';
import { UserHeroRepository } from './user-hero.repository';

@Injectable()
export class UserHeroService {
  constructor(
    private readonly userHeroRepository: UserHeroRepository,
    private readonly userRepository: UserRepository,
    private dataSource: DataSource,
  ) {}

  async create(data: { hero_id: number; user_id: number }) {
    return this.userHeroRepository.save(data);
  }

  async updatePoint(
    id: number,
    data: {
      atk_point: number;
      def_point: number;
      hp_point: number;
      spd_point: number;
      user_id: number;
    },
  ) {
    const userHero = await this.userHeroRepository.findOne({
      where: {
        id,
      },
      select: ['level'],
    });

    const { atk_point, def_point, hp_point, spd_point } = data;

    if (userHero.level < atk_point + def_point + hp_point + spd_point) {
      throw new HttpException(
        {
          atk_point: 'The total point cannot be greater than the level',
          def_point: 'The total point cannot be greater than the level',
          hp_point: 'The total point cannot be greater than the level',
          spd_point: 'The total point cannot be greater than the level',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return this.userHeroRepository.update(
      { id: id, user_id: data.user_id },
      data,
    );
  }

  async levelUp(id: number, user_id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    try {
      const user = await manager.findOne(UserEntity, {
        where: {
          id: user_id,
        },
        select: ['id', 'balance'],
        lock: { mode: 'pessimistic_write' },
      });

      const { balance } = user;

      const userHero = await manager.findOne(UserHeroEntity, {
        where: {
          id,
          user_id,
        },
        lock: { mode: 'pessimistic_write' },
      });

      let { level } = userHero;
      const amount = Math.pow(2, ++level);

      console.log({ balance, amount });

      if (balance < amount) {
        throw new HttpException(
          'The amount is not enough to level up',
          HttpStatus.CONFLICT,
        );
      }

      await manager.update(
        UserEntity,
        {
          id: user_id,
        },
        {
          balance: balance - amount,
        },
      );

      await manager.update(
        UserHeroEntity,
        {
          id,
        },
        { level: level + 1 },
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
