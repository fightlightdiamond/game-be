import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChartsService } from './charts.service';

@ApiTags('charts')
@Controller('charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Get('gold')
  @ApiOperation({ summary: 'Gold Charts' })
  @ApiResponse({ status: 200, description: 'Get Gold Charts successfully.' })
  async gold() {
    return this.chartsService.gold();
  }
}
