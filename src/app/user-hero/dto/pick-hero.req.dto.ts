import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HeroExists } from '../../../common/validators/hero-exists.validator';

export class PickHeroReqDto {
  @ApiProperty({
    description: 'The hero id',
    example: 1,
  })
  @IsNotEmpty()
  @HeroExists()
  hero_id: number;
}
