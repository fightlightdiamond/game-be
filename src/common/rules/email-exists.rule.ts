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
export class EmailExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private usersRepository: Repository<AccountOrmEntity>,
  ) {}

  async validate(value: string) {
    return !(await this.usersRepository.findOneBy({ email: value }));
  }

  defaultMessage(args: ValidationArguments) {
    return `Email exist ${args.value}`;
  }
}
