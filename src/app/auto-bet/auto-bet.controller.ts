import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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
import { AutoBetService } from './auto-bet.service';
import { AutoBetUpdateReqDto } from './dto/auto-bet-update.req.dto';

@ApiTags('auto-bet')
@Controller('auto-bet')
export class AutoBetController {
  constructor(private readonly autoBetService: AutoBetService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get('')
  @ApiOperation({ summary: 'get owner auto-bet' })
  @ApiResponse({ status: 200, description: 'get owner auto-bet successfully.' })
  @UsePipes(ValidationPipe)
  async getOwner(@Req() request) {
    const { user } = request;
    return this.autoBetService.getOwner(user.id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('')
  @ApiOperation({ summary: 'create auto-bet' })
  @ApiResponse({ status: 200, description: 'create auto-bet successfully.' })
  @UsePipes(ValidationPipe)
  async create(@Req() request) {
    const { user } = request;
    return this.autoBetService.createBet(user.id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Put('/:id')
  @ApiOperation({ summary: 'update auto-bet' })
  @ApiResponse({ status: 200, description: 'update auto-bet successfully.' })
  @UsePipes(ValidationPipe)
  async update(@Param() id, @Req() request, @Body() body: AutoBetUpdateReqDto) {
    return this.autoBetService.update(id, body);
  }
}
