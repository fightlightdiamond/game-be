import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseMatchOrmEntity } from '../../modules/betting/infrastructure/persistence/typeorm/house-match.orm-entity';

@Injectable()
export class HouseMatchExistsPipe implements PipeTransform {
  constructor(
    @InjectRepository(HouseMatchOrmEntity)
    private matchRepository: Repository<HouseMatchOrmEntity>,
  ) {}

  async transform(value: any) {
    try {
      await this.matchRepository.findOneByOrFail({ id: value });
    } catch (e) {
      throw new BadRequestException('Match not found');
    }
    return value;
  }
}
