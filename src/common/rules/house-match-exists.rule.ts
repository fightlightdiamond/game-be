import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseMatchOrmEntity } from '../../modules/betting/infrastructure/persistence/typeorm/house-match.orm-entity';

@ValidatorConstraint({ name: 'HouseMatchExists', async: true })
@Injectable()
export class HouseMatchExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(HouseMatchOrmEntity)
    private matchRepository: Repository<HouseMatchOrmEntity>,
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
