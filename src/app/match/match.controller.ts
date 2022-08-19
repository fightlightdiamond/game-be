import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchService } from './match.service';

@ApiTags('match')
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('')
  async match() {
    return this.matchService.bet();
  }

  @ApiOperation({ summary: 'Match History' })
  @ApiResponse({ status: 200, description: 'Match History successfully.' })
  @Get('/history')
  async histories() {
    return this.matchService.history();
  }
}
