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

  // @UseGuards(JwtGuard)
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
  async getByMatch(@Req() request, @Body('match_id') match_id: number) {
    const { user } = request;
    return this.betService.getOneByData({ match_id, user_id: user.id });
  }
}
