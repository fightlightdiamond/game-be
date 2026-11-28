import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../../modules/identity/infrastructure/persistence/typeorm/user.orm-entity';

@Injectable()
export class EmailExistsPipe implements PipeTransform {
  constructor(
    @InjectRepository(UserOrmEntity)
    private userRepository: Repository<UserOrmEntity>,
  ) {}

  async transform(value: string) {
    try {
      await this.userRepository.findOneByOrFail({ email: value });
    } catch (e) {
      throw new BadRequestException('User not found');
    }
    return value;
  }
}
