import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetHeroQuery } from '../../application/queries/get-hero/get-hero.query';
import { ListHeroesQuery } from '../../application/queries/list-heroes/list-heroes.query';

@ApiTags('heroes')
@Controller('heroes')
export class HeroController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @ApiOperation({ summary: 'List all heroes' })
  @ApiResponse({ status: 200, description: 'List heroes successfully.' })
  async list() {
    return this.queryBus.execute(new ListHeroesQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hero by id' })
  @ApiResponse({ status: 200, description: 'Get hero successfully.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetHeroQuery(id));
  }
}
