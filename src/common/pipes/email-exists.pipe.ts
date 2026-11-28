import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountOrmEntity } from '../../modules/identity/infrastructure/persistence/typeorm/account.orm-entity';

@Injectable()
export class EmailExistsPipe implements PipeTransform {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private userRepository: Repository<AccountOrmEntity>,
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
