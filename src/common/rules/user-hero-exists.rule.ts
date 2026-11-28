import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnedHeroOrmEntity } from '../../modules/ranking/infrastructure/persistence/typeorm/owned-hero.orm-entity';

@ValidatorConstraint({ name: 'UserHeroExists', async: true })
@Injectable()
export class UserHeroExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(OwnedHeroOrmEntity)
    private userHeroRepository: Repository<OwnedHeroOrmEntity>,
  ) {}

  async validate(value: number) {
    return !!(await this.userHeroRepository.findOneBy({ id: value }));
  }

  defaultMessage(args: ValidationArguments) {
    return `User Hero doesn't exist ${args.value}`;
  }
}
