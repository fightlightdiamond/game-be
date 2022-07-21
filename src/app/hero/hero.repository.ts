import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { HeroesEntity } from './heroes.entity';

@Injectable()
export class PollRepository {
  constructor(
    @Inject('HERO_REPOSITORY')
    private repository: Repository<HeroesEntity>,
  ) {}
}
