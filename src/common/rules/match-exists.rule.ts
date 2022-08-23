import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { MatchRepository } from '../../app/match/match.repository';

@ValidatorConstraint({ name: 'MatchExists', async: true })
@Injectable()
export class MatchExistsRule implements ValidatorConstraintInterface {
  constructor(private matchRepository: MatchRepository) {}

  async validate(value: number) {
    try {
      await this.matchRepository.findOneByOrFail({
        id: value,
      });
    } catch (e) {
      console.log(e);
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Match doesn't exist ${args.value}`;
  }
}
