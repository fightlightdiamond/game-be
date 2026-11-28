import { Injectable } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroOrmEntity } from '../modules/hero-catalog/infrastructure/persistence/typeorm/hero.orm-entity';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(HeroOrmEntity)
    private readonly heroRepository: Repository<HeroOrmEntity>,
  ) {}

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
