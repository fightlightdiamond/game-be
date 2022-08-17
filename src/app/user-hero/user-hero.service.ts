import { Injectable } from '@nestjs/common';
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
      atk_plus: number;
      def_plus: number;
      hp_plus: number;
      spd_plus: number;
      user_id: number;
    },
  ) {
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
      // const user = await this.userRepository.findOne({
      //   where: {
      //     id: user_id,
      //   },
      //   select: ['id', 'balance'],
      //   lock: { mode: 'pessimistic_write' },
      // });

      const { balance } = user;

      // const userHero = await this.userHeroRepository.findOne({
      //   where: {
      //     id,
      //     user_id,
      //   },
      //   lock: { mode: 'pessimistic_write' },
      // });

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

      if (balance > amount) {
        // await this.userRepository.update(
        //   {
        //     id: user.id,
        //   },
        //   {
        //     balance: balance - amount,
        //   },
        // );
        //
        // await this.userHeroRepository.update(
        //   {
        //     id,
        //   },
        //   {
        //     level: level + 1,
        //   },
        // );

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
      } else {
        throw Error('Khong du tien nang cap');
      }
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
