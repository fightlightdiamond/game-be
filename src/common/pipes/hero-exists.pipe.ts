import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { HeroRepository } from '../../app/hero/hero.repository';

@Injectable()
export class HeroExistsPipe implements PipeTransform {
  constructor(private heroRepository: HeroRepository) {}

  async transform(value: any) {
    try {
      await this.heroRepository.findOneByOrFail({
        id: value,
      });
    } catch (e) {
      throw new BadRequestException('Hero not found');
    }

    return value;
  }
}
