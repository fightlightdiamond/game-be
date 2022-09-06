import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HeroRepository } from '../hero/hero.repository';
import { RoundService } from './round.service';

@ApiTags('match')
@Controller('round')
export class RoundController {
  constructor(
    private readonly roundService: RoundService,
    private readonly heroRepository: HeroRepository,
  ) {}

  @ApiOperation({ summary: 'get round' })
  @ApiResponse({ status: 200, description: 'get round successfully.' })
  @Get('')
  async a() {
    const heroes = await this.heroRepository.getPairHeroes();
    const a = heroes[0];
    const b = heroes[1];
    const x = this.roundService.preBet(a, b);
    return x.execute();
  }
}
