import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BettingMatchOrmEntity } from '../../modules/betting/infrastructure/persistence/typeorm/betting-match.orm-entity';

@Injectable()
export class MatchExistsPipe implements PipeTransform {
  constructor(
    @InjectRepository(BettingMatchOrmEntity)
    private matchRepository: Repository<BettingMatchOrmEntity>,
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
