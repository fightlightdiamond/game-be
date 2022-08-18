import {
  Body,
  Controller,
  Post,
  Req,
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
import { BetReqDto } from './dto/bet.req.dto';
import { BetService } from './bet.service';

@ApiTags('bet')
@Controller('bets')
export class BetController {
  constructor(private readonly betService: BetService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('')
  @ApiOperation({ summary: 'bet' })
  @ApiResponse({ status: 200, description: 'bet successfully.' })
  @UsePipes(ValidationPipe)
  async bet(@Req() request, @Body() body: BetReqDto) {
    const { user } = request;
    return this.betService.bet({ ...body, user_id: user.id });
  }
}
