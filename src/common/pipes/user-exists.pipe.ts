import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../../modules/identity/infrastructure/persistence/typeorm/user.orm-entity';

@Injectable()
export class UserExistsPipe implements PipeTransform {
  constructor(
    @InjectRepository(UserOrmEntity)
    private userRepository: Repository<UserOrmEntity>,
  ) {}

  async transform(value: any) {
    try {
      await this.userRepository.findOneByOrFail({ id: value });
    } catch (e) {
      throw new BadRequestException('User not found');
    }
    return value;
  }
}
