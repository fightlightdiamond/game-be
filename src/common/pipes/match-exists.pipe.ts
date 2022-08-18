import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { MatchRepository } from '../../app/match/match.repository';

@Injectable()
export class MatchExistsPipe implements PipeTransform {
  constructor(private matchRepository: MatchRepository) {}

  async transform(value: any) {
    try {
      await this.matchRepository.findOneByOrFail({
        id: value,
      });
    } catch (e) {
      throw new BadRequestException('Match not found');
    }

    return value;
  }
}
