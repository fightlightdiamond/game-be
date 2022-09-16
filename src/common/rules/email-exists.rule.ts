import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../app/user/user.repository';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class EmailExistsRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UserRepository) {}

  async validate(value: string) {
    return !(await this.usersRepository.findOneBy({
      email: value,
    }));
  }

  defaultMessage(args: ValidationArguments) {
    return `Email exist ${args.value}`;
  }
}
