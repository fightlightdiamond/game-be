import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { GemLevelUpConstant } from './constants/gem-level-up.constant';
import { GemTypeConstant } from './constants/gem-type.constant';
import { GetGemsDto } from './dtos/get-gems.dto';
import { LevelUpGemDto } from './dtos/level-up-gem.dto';
import { UserGemRepository } from './user-gem.repository';
import { UserGemEntity } from 'src/migrations/entities/user-gem.entity';
import { GEM_COMMON_CONST } from 'src/common/constants/gems-common.constant';

@Injectable()
export class UserGemService {
  constructor(private readonly userGemRepository: UserGemRepository) {}

  async all(getGemDto: GetGemsDto, userId: number): Promise<UserGemEntity[]> {
    const { page, limit } = getGemDto;
    return this.userGemRepository
      .createQueryBuilder()
      .select('*')
      .where('user_id = :userId', { userId: userId })
      .andWhere('available_num + attached_num > 0')
      .orderBy('level', 'DESC')
      .limit(limit)
      .offset(limit * (page - 1))
      .getRawMany();
  }

  isDropGem(): boolean {
    const r = Math.floor(Math.random() * 100) + 1;
    if (r <= GEM_COMMON_CONST.DROP_CHANCE) {
      return true;
    }
    return false;
  }

  async add(
    userId: number,
    type: string = null,
    level: number = null,
  ): Promise<boolean> {
    if (!type) {
      type = this.randomGemType(GemTypeConstant);
    }
    if (!level) {
      level = 1;
    }
    const existedGem = await this.userGemRepository.findOne({
      where: {
        user_id: userId,
        level: level,
        type: type,
      },
    });
    if (existedGem) {
      await this.userGemRepository.update(
        {
          user_id: userId,
          level: level,
        },
        { available_num: () => 'available_num + 1' },
      );
    } else {
      const gem = new UserGemEntity();
      gem.user_id = userId;
      gem.level = level;
      gem.type = type;
      gem.available_num = 1;
      gem.attached_num = 0;
      await gem.save();
    }
    return true;
  }

  randomGemType(allGemType: object): string {
    const keys = Object.keys(allGemType);
    return allGemType[keys[(keys.length * Math.random()) << 0]];
  }

  async levelUp(
    levelUpGemBody: LevelUpGemDto,
    userId: number,
  ): Promise<object> {
    const level = levelUpGemBody.level;
    const type = levelUpGemBody.type;
    const usedGemNumber = levelUpGemBody.number;
    const userGems = await this.userGemRepository.findOne({
      where: {
        user_id: userId,
        type: type,
        level: level,
      },
    });
    console.log('userGems:', userGems);

    if (
      !userGems ||
      !this.isEnoughGem(usedGemNumber, userGems?.available_num)
    ) {
      throw new UnprocessableEntityException({
        message: `Your gems not enough`,
      });
    }
    const successChance = (usedGemNumber / GemLevelUpConstant.MAX_GEMS) * 100;
    let message = `Level up gem failure!`;
    const r = Math.floor(Math.random() * 100) + 1;
    if (r <= successChance) {
      await this.add(userId, type, level + 1);
      message = `Level up gem successfully!`;
    }
    await this.decreaseGems(userId, type, level, usedGemNumber);
    return {
      message,
    };
  }

  isEnoughGem(usedGems: number, availableGem: number): boolean {
    return usedGems <= availableGem;
  }

  async decreaseGems(
    userId: number,
    type: string,
    level: number,
    usedGemNumber: number,
  ) {
    await this.userGemRepository.update(
      {
        user_id: userId,
        type: type,
        level: level,
      },
      { available_num: () => `available_num - ${usedGemNumber}` },
    );
  }
}
