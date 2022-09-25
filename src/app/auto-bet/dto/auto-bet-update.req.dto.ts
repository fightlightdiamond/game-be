import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HeroExists } from '../../../common/validators/hero-exists.validator';

export class AutoBetUpdateReqDto {
  @ApiProperty({
    description: 'The hero id',
    example: 1,
  })
  @IsNotEmpty()
  @HeroExists()
  hero_id: number;

  @ApiProperty({
    description: 'The enable',
    example: 1,
  })
  @IsNotEmpty()
  @HeroExists()
  is_enable: number;

  @ApiProperty({
    description: 'The bet percentage balance',
    example: 1,
  })
  @IsNotEmpty()
  @HeroExists()
  bet_percentage: number;
}
