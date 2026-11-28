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
import { GetOwnedHeroQuery } from '../../application/queries/get-owned-hero/get-owned-hero.query';
import { LevelUpOwnedHeroCommand } from '../../application/commands/level-up-owned-hero/level-up-owned-hero.command';
import { AllocatePointsCommand } from '../../application/commands/allocate-points/allocate-points.command';
import { ClaimOwnedHeroCommand } from '../../application/commands/claim-owned-hero/claim-owned-hero.command';
import { AllocatePointsDto } from './dtos/allocate-points.dto';
import { ClaimOwnedHeroDto } from './dtos/claim-owned-hero.dto';

@ApiTags('user-heroes')
@Controller('user-heroes')
export class OwnedHeroController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async getMyHero(@Request() req) {
    return this.queryBus.execute(new GetOwnedHeroQuery(req.user.id));
  }

  @Post('claim')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async claim(@Body() dto: ClaimOwnedHeroDto, @Request() req) {
    return this.commandBus.execute(
      new ClaimOwnedHeroCommand(req.user.id, dto.heroId),
    );
  }

  @Post('level-up/:id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async levelUp(@Param('id') id: number, @Request() req) {
    return this.commandBus.execute(
      new LevelUpOwnedHeroCommand(Number(id), req.user.id),
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
