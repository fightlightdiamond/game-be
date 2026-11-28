import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../../modules/identity/infrastructure/persistence/typeorm/user.orm-entity';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class EmailExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(UserOrmEntity)
    private usersRepository: Repository<UserOrmEntity>,
  ) {}

  async validate(value: string) {
    return !(await this.usersRepository.findOneBy({ email: value }));
  }

  defaultMessage(args: ValidationArguments) {
    return `Email exist ${args.value}`;
  }
}
