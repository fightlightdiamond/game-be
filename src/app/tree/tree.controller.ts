import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
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
import { TreeService } from './tree.service';

@ApiTags('Lucky-tree')
@Controller('tree')
export class TreeController {
  constructor(private readonly treeService: TreeService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('planting')
  @ApiOperation({ summary: 'planting tree money' })
  @ApiResponse({ status: 200, description: 'tree planting successfully.' })
  @UsePipes(ValidationPipe)
  async planting(@Req() request) {
    const { user } = request;
    return this.treeService.planting(user.id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('rob/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of tree',
  })
  @ApiOperation({ summary: 'rob tree money' })
  @ApiResponse({ status: 200, description: 'rob tree successfully.' })
  @UsePipes(ValidationPipe)
  async rob(@Req() request, @Param('id', ParseIntPipe) id) {
    const { user } = request;
    return this.treeService.rob(id, user.id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('finish-planting/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of tree',
  })
  @ApiOperation({ summary: 'finished planting' })
  @ApiResponse({ status: 200, description: 'Planting Complete.' })
  @UsePipes(ValidationPipe)
  async finish(@Req() request, @Param('id', ParseIntPipe) id) {
    const { user } = request;
    return this.treeService.finishedPlanting(id, user.id);
  }
}
