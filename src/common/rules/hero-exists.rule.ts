import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroOrmEntity } from '../../modules/hero-catalog/infrastructure/persistence/typeorm/hero.orm-entity';

@ValidatorConstraint({ name: 'HeroExists', async: true })
@Injectable()
export class HeroExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(HeroOrmEntity)
    private heroRepository: Repository<HeroOrmEntity>,
  ) {}

  async validate(value: number) {
    try {
      await this.heroRepository.findOneByOrFail({ id: value });
    } catch (e) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Hero doesn't exist ${args.value}`;
  }
}
