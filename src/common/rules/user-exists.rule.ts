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
export class UserExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(UserOrmEntity)
    private usersRepository: Repository<UserOrmEntity>,
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
