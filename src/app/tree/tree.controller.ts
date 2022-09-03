import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TreeService } from './tree.service';

@ApiTags('user-hero')
@Controller('tree')
export class TreeController {
  constructor(private readonly treeService: TreeService) {}

  @Post('planting')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'planting tree money' })
  @ApiResponse({ status: 200, description: 'tree planting successfully.' })
  @UsePipes(ValidationPipe)
  async planting(@Req() request) {
    const { user } = request;
    return this.treeService.planting(user.id);
  }

  @Post('rob')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'rob tree money' })
  @ApiResponse({ status: 200, description: 'rob tree successfully.' })
  @UsePipes(ValidationPipe)
  async rob(@Req() request, @Param('id', ParseIntPipe) id) {
    const { user } = request;
    return this.treeService.rob(id, user.id);
  }

  @Post('finish-planting')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'finished planting' })
  @ApiResponse({ status: 200, description: 'Planting Complete.' })
  @UsePipes(ValidationPipe)
  async finish(@Req() request, @Param('id', ParseIntPipe) id) {
    const { user } = request;
    return this.treeService.finishedPlanting(id, user.id);
  }
}
