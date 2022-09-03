import { Injectable } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HeroRepository } from '../app/hero/hero.repository';

@Injectable()
export class MasterService {
  constructor(private readonly heroRepository: HeroRepository) {}

  @ApiOperation({ summary: 'master data' })
  @ApiResponse({ status: 200, description: 'get master data successfully.' })
  async master() {
    const heroes = await this.heroRepository.find({
      select: ['id', 'name'],
    });
    return {
      heroes,
    };
  }
}
