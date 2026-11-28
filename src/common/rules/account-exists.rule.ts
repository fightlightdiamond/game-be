import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountOrmEntity } from '../../modules/identity/infrastructure/persistence/typeorm/account.orm-entity';

@ValidatorConstraint({ name: 'AccountExists', async: true })
@Injectable()
export class AccountExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private accounts: Repository<AccountOrmEntity>,
  ) {}

  async validate(value: number) {
    try {
      await this.accounts.findOneByOrFail({ id: value });
    } catch (e) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `User doesn't exist ${args.value}`;
  }
}
