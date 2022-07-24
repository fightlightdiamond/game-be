import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { HeroEntity } from './hero.entity';

@Injectable()
export class PollRepository {
  constructor(
    @Inject('HERO_REPOSITORY')
    private repository: Repository<HeroEntity>,
  ) {}
}
