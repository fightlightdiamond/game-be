import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HeroService } from './hero.service';

@ApiTags('heroes')
@Controller('heroes')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get('')
  @ApiOperation({ summary: 'Hero' })
  @ApiResponse({ status: 200, description: 'Get Hero successfully.' })
  async index() {
    return this.heroService.all();
  }
}
