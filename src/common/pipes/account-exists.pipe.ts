import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountOrmEntity } from '../../modules/identity/infrastructure/persistence/typeorm/account.orm-entity';

@Injectable()
export class AccountExistsPipe implements PipeTransform {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private accounts: Repository<AccountOrmEntity>,
  ) {}

  async transform(value: any) {
    try {
      await this.accounts.findOneByOrFail({ id: value });
    } catch (e) {
      throw new BadRequestException('User not found');
    }
    return value;
  }
}
