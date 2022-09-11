import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserHeroRepository } from '../../app/user-hero/user-hero.repository';

@ValidatorConstraint({ name: 'UserHeroExists', async: true })
@Injectable()
export class UserHeroExistsRule implements ValidatorConstraintInterface {
  constructor(private userHeroRepository: UserHeroRepository) {}

  async validate(value: number) {
    return !!(await this.userHeroRepository.findOneBy({
      id: value,
    }));
  }

  defaultMessage(args: ValidationArguments) {
    return `User Hero doesn't exist ${args.value}`;
  }
}
