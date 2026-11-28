import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnedHeroOrmEntity } from '../../modules/ranking/infrastructure/persistence/typeorm/owned-hero.orm-entity';

@ValidatorConstraint({ name: 'OwnedHeroExists', async: true })
@Injectable()
export class OwnedHeroExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(OwnedHeroOrmEntity)
    private ownedHeroes: Repository<OwnedHeroOrmEntity>,
  ) {}

  async validate(value: number) {
    return !!(await this.ownedHeroes.findOneBy({ id: value }));
  }

  defaultMessage(args: ValidationArguments) {
    return `User Hero doesn't exist ${args.value}`;
  }
}
