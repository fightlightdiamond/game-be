import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
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
import { Cache } from 'cache-manager';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { HeroExistsPipe } from '../../common/pipes/hero-exists.pipe';
import { UserHeroService } from './user-hero.service';
import { PickHeroReqDto } from './dto/pick-hero.req.dto';
import { UpdatePointHeroReqDto } from './dto/update-point-hero.req.dto';

@ApiTags('user-hero')
@Controller('user-heroes')
export class UserHeroController {
  constructor(
    private readonly userHeroService: UserHeroService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('')
  @ApiOperation({ summary: 'user-heroes' })
  @ApiResponse({ status: 200, description: 'select heroes successfully.' })
  @UsePipes(ValidationPipe)
  async gets(@Query() query) {
    const key = JSON.stringify(query);
    const value = await this.cacheManager.get(key);
    if (value) {
      return value;
    }
    query.limit = 100;
    const userHeroes = await this.userHeroService.paginate(query);
    await this.cacheManager.set(key, userHeroes, 1);

    return userHeroes;
  }

  @Get('/my-heroes')
  @ApiOperation({ summary: 'my hero' })
  @ApiResponse({ status: 200, description: 'select my hero successfully.' })
  @UsePipes(ValidationPipe)
  async my(@Req() request) {
    const { user } = request;
    const { id } = user;
    const key = `my_hero_${id}`;
    const value = await this.cacheManager.get(key);
    if (value) {
      return value;
    }
    const userHeroes = await this.userHeroService.getByUser(id);
    await this.cacheManager.set(key, userHeroes, 1);

    return userHeroes;
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('')
  @ApiOperation({ summary: 'select hero for fight elo match' })
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
