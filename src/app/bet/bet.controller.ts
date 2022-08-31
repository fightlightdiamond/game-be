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
import { BetFindOneReqDto } from './dto/bet-find-one.req.dto';

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

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('/find-one')
  @ApiOperation({ summary: 'bet find one' })
  @ApiResponse({ status: 200, description: 'bet find one successfully.' })
  @UsePipes(ValidationPipe)
  async getByMatch(@Req() request, @Body() body: BetFindOneReqDto) {
    const { user } = request;
    return this.betService.getOneByData({
      match_id: body.match_id,
      user_id: user.id,
    });
  }
}
