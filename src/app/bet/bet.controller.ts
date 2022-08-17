import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { BetReqDto } from './dto/bet.req.dto';
import { BetRepository } from './bet.repository';

@ApiTags('bet')
@Controller('bets')
export class BetController {
  constructor(private readonly betRepository: BetRepository) {}

  @UseGuards(JwtGuard)
  @Post('')
  @ApiOperation({ summary: 'bet' })
  @ApiResponse({ status: 200, description: 'bet successfully.' })
  @UsePipes(ValidationPipe)
  async bet(@Req() request, @Body() body: BetReqDto) {
    const { user } = request;
    return this.betRepository.save({ ...body, user_id: user.id });
  }
}
