import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MatchService } from './match.service';

@ApiTags('match')
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('')
  async match() {
    return this.matchService.bet();
  }
}
