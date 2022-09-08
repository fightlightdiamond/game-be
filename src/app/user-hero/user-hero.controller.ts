import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { HeroExistsPipe } from '../../common/pipes/hero-exists.pipe';
import { UserHeroService } from './user-hero.service';
import { PickHeroReqDto } from './dto/pick-hero.req.dto';
import { UpdatePointHeroReqDto } from './dto/update-point-hero.req.dto';

@ApiTags('user-hero')
@Controller('user-heroes')
export class UserHeroController {
  constructor(private readonly userHeroService: UserHeroService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get('')
  @ApiOperation({ summary: 'user-heroes' })
  @ApiResponse({ status: 200, description: 'select heroes successfully.' })
  @UsePipes(ValidationPipe)
  async gets(@Query() query) {
    return this.userHeroService.paginate(query);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('/atk')
  @ApiOperation({ summary: 'user-heroes' })
  @ApiResponse({ status: 200, description: 'select heroes successfully.' })
  @UsePipes(ValidationPipe)
  async atk(@Body() body: { hero_id: number; competitor: number }) {
    return this.userHeroService.atk(body);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('')
  @ApiOperation({ summary: 'user-heroes' })
  @ApiResponse({ status: 200, description: 'select heroes successfully.' })
  @UsePipes(ValidationPipe)
  async pickHero(@Body() body: PickHeroReqDto, @Req() request) {
    const { user } = request;
    return this.userHeroService.create({ ...body, user_id: user.id });
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'The id of user hero',
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update point plus for user hero' })
  @ApiResponse({ status: 200, description: 'update Point successfully.' })
  @UsePipes(ValidationPipe)
  async updatePoint(
    @Param('id', HeroExistsPipe) id,
    @Body() body: UpdatePointHeroReqDto,
    @Req() request,
  ) {
    const { user } = request;
    return this.userHeroService.updatePoint(id, { ...body, user_id: user.id });
  }

  @UseGuards(JwtGuard)
  @Put('level-up/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of user hero',
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update level for user hero' })
  @ApiResponse({ status: 200, description: 'update level hero successfully.' })
  @UsePipes(ValidationPipe)
  async levelUp(@Param('id', ParseIntPipe) id, @Req() request) {
    const { user } = request;
    return this.userHeroService.levelUp(id, user.id);
  }
}
