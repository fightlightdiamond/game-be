import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EloMatchService } from './elo-match.service';
import { FightEloMatchDto } from './dto/fight-elo-match.dto';

@ApiTags('elo-matches')
@Controller('elo-matches')
export class EloMatchController {
  constructor(private readonly eloMatchService: EloMatchService) {}

  /**
   * ATK
   * @param req
   * @param body
   */
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('')
  @ApiOperation({ summary: 'atk elo-matches' })
  @ApiResponse({ status: 200, description: 'atk elo-matches successfully.' })
  @UsePipes(ValidationPipe)
  async atk(@Request() req, @Body() body: FightEloMatchDto) {
    const { competitor } = body;
    return this.eloMatchService.fight(req.user.id, competitor);
  }
}
