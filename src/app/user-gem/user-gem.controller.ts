import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetGemsDto } from './dtos/get-gems.dto';
import { LevelUpGemDto } from './dtos/level-up-gem.dto';
import { UserGemService } from './user-gem.service';

@ApiTags('user-gem')
@Controller('user-gem')
export class UserGemController {
  constructor(private readonly userGemService: UserGemService) {}

  @Get('')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all gems of user pagination' })
  @ApiResponse({ status: 200, description: 'Get Gems successfully.' })
  async index(@Query() getGemDto: GetGemsDto, @Req() request) {
    const { user } = request;
    return this.userGemService.all(getGemDto, user.id);
  }

  // Generate gems for test
  // @Get('add')
  // @UseGuards(JwtGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'UserGems' })
  // async add(
  //   @Req() request
  // ) {
  //   const { user } = request;
  //   return await this.userGemService.add(user.id);
  // }

  @Post('level-up')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Level up gems by gems has lower level' })
  @ApiResponse({ status: 200, description: 'Level up gem success.' })
  async levelUp(@Body() levelUpGemBody: LevelUpGemDto, @Req() request) {
    const { user } = request;
    return this.userGemService.levelUp(levelUpGemBody, user.id);
  }
}
