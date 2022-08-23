import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchExistsPipe } from '../../common/pipes/match-exists.pipe';
import { MatchService } from './match.service';

@ApiTags('match')
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('')
  async match() {
    const match = await this.matchService.bet();
    return match.turns;
  }

  @Get('betting')
  async betting() {
    return this.matchService.betting();
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of match',
  })
  @ApiOperation({ summary: 'get match' })
  @ApiResponse({ status: 200, description: 'get match successfully.' })
  async find(@Param('id', MatchExistsPipe) id) {
    return this.matchService.find(id);
  }

  @ApiOperation({ summary: 'Match History' })
  @ApiResponse({ status: 200, description: 'Match History successfully.' })
  @Get('/history')
  async histories() {
    return this.matchService.history();
  }
}
