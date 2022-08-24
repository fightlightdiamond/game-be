import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('ping')
  root() {
    return '0k';
  }
}
