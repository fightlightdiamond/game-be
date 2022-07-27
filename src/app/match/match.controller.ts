import { Controller, Get } from '@nestjs/common';
import { Hero } from '../hero/interfaces/hero.interface';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
  @Get('')
  async match() {
    const a = new Hero();
    const b = new Hero();
    const w = new MatchService(a, b);
    return w.execute();
  }
}
