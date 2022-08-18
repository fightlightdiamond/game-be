import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { HeroRepository } from '../../app/hero/hero.repository';

@ValidatorConstraint({ name: 'HeroExists', async: true })
@Injectable()
export class HeroExistsRule implements ValidatorConstraintInterface {
  constructor(private heroRepository: HeroRepository) {}

  async validate(value: number) {
    try {
      await this.heroRepository.findOneByOrFail({
        id: value,
      });
    } catch (e) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Hero doesn't exist ${args.value}`;
  }
}
