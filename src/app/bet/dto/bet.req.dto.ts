import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BetReqDto {
  @ApiProperty({
    description: 'The match id',
    example: 1,
  })
  @IsNotEmpty()
  match_id: number;

  @ApiProperty({
    description: 'The hero id',
    example: 1,
  })
  @IsNotEmpty()
  hero_id: number;

  @ApiProperty({
    description: 'The balance bet',
    example: 1,
  })
  @IsNotEmpty()
  balance: number;
}
