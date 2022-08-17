import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PickHeroReqDto {
  @ApiProperty({
    description: 'The hero id',
    example: 1,
  })
  @IsNotEmpty()
  hero_id: number;
}
