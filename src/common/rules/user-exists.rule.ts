import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountOrmEntity } from '../../modules/identity/infrastructure/persistence/typeorm/account.orm-entity';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UserExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private usersRepository: Repository<AccountOrmEntity>,
  ) {}

  async validate(value: number) {
    try {
      await this.usersRepository.findOneByOrFail({ id: value });
    } catch (e) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `User doesn't exist ${args.value}`;
  }
}
