import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BettingMatchOrmEntity } from '../../modules/betting/infrastructure/persistence/typeorm/betting-match.orm-entity';

@ValidatorConstraint({ name: 'MatchExists', async: true })
@Injectable()
export class MatchExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(BettingMatchOrmEntity)
    private matchRepository: Repository<BettingMatchOrmEntity>,
  ) {}

  async validate(value: number) {
    try {
      await this.matchRepository.findOneByOrFail({ id: value });
    } catch (e) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Match doesn't exist ${args.value}`;
  }
}
