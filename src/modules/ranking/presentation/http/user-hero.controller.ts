import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../../identity/infrastructure/auth/jwt.guard';
import { GetUserHeroQuery } from '../../application/queries/get-user-hero/get-user-hero.query';
import { LevelUpUserHeroCommand } from '../../application/commands/level-up-user-hero/level-up-user-hero.command';
import { AllocatePointsCommand } from '../../application/commands/allocate-points/allocate-points.command';
import { AllocatePointsDto } from './dtos/allocate-points.dto';

@ApiTags('user-heroes')
@Controller('user-heroes')
export class UserHeroController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async getMyHero(@Request() req) {
    return this.queryBus.execute(new GetUserHeroQuery(req.user.id));
  }

  @Post('level-up/:id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async levelUp(@Param('id') id: number, @Request() req) {
    return this.commandBus.execute(
      new LevelUpUserHeroCommand(Number(id), req.user.id),
    );
  }

  @Post('allocate/:id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async allocatePoints(
    @Param('id') id: number,
    @Body() dto: AllocatePointsDto,
    @Request() req,
  ) {
    return this.commandBus.execute(
      new AllocatePointsCommand(
        Number(id),
        req.user.id,
        dto.atk_point,
        dto.def_point,
        dto.hp_point,
        dto.spd_point,
        dto.crit_rate_point,
      ),
    );
  }
}
