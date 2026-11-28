import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../../identity/infrastructure/auth/jwt.guard';
import { LevelUpGemCommand } from '../../application/commands/level-up-gem/level-up-gem.command';
import { LevelUpGemDto } from './dtos/level-up-gem.dto';

@ApiTags('gems')
@Controller('gems')
export class GemController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('level-up')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async levelUp(@Body() dto: LevelUpGemDto, @Request() req) {
    return this.commandBus.execute(
      new LevelUpGemCommand(req.user.id, dto.type, dto.level, dto.spent),
    );
  }
}
