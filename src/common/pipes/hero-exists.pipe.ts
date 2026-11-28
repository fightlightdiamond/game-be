import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroOrmEntity } from '../../modules/hero-catalog/infrastructure/persistence/typeorm/hero.orm-entity';

@Injectable()
export class HeroExistsPipe implements PipeTransform {
  constructor(
    @InjectRepository(HeroOrmEntity)
    private heroRepository: Repository<HeroOrmEntity>,
  ) {}

  async transform(value: any) {
    try {
      await this.heroRepository.findOneByOrFail({ id: value });
    } catch (e) {
      throw new BadRequestException('Hero not found');
    }
    return value;
  }
}
