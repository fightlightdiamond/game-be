import { Injectable } from '@nestjs/common';
import { HeroRepository } from './hero.repository';

@Injectable()
export class HeroService {
  constructor(private readonly heroRepository: HeroRepository) {}

  async all() {
    return this.heroRepository.find();
  }
}
