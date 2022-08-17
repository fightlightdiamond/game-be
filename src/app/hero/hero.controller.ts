import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('hero')
@Controller('heroes')
export class HeroController {}
