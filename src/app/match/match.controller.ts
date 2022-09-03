import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MatchExistsPipe } from '../../common/pipes/match-exists.pipe';
import { MatchService } from './match.service';
import { PaginateReqDto } from './dto/paginate.req.dto';

@ApiTags('match')
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @ApiQuery({
    type: PaginateReqDto,
  })
  @ApiOperation({ summary: 'paginate match' })
  @ApiResponse({ status: 200, description: 'paginate match successfully.' })
  @Get('')
  async paginate(@Query() query) {
    return this.matchService.paginate(query);
  }

  @Get('current')
  async current() {
    return this.matchService.current();
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of match',
  })
  @ApiOperation({ summary: 'get current match' })
  @ApiResponse({ status: 200, description: 'get current match successfully.' })
  async find(@Param('id', MatchExistsPipe) id) {
    return this.matchService.find(id);
  }

  @ApiOperation({ summary: 'Match History' })
  @ApiResponse({ status: 200, description: 'Match History successfully.' })
  @Get('/history')
  async histories() {
    return this.matchService.history();
  }
}
