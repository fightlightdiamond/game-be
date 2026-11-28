import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserHeroOrmEntity } from '../../modules/ranking/infrastructure/persistence/typeorm/user-hero.orm-entity';

@ValidatorConstraint({ name: 'UserHeroExists', async: true })
@Injectable()
export class UserHeroExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(UserHeroOrmEntity)
    private userHeroRepository: Repository<UserHeroOrmEntity>,
  ) {}

  async validate(value: number) {
    return !!(await this.userHeroRepository.findOneBy({ id: value }));
  }

  defaultMessage(args: ValidationArguments) {
    return `User Hero doesn't exist ${args.value}`;
  }
}
