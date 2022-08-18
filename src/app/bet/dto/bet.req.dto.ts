import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchExists } from '../../../common/validators/match-exists.validator';
import { HeroExists } from '../../../common/validators/hero-exists.validator';

export class BetReqDto {
  @ApiProperty({
    description: 'The match id',
    example: 1,
  })
  @IsNotEmpty()
  @MatchExists()
  match_id: number;

  @ApiProperty({
    description: 'The hero id',
    example: 1,
  })
  @IsNotEmpty()
  @HeroExists()
  hero_id: number;

  @ApiProperty({
    description: 'The balance bet',
    example: 1,
  })
  @IsNotEmpty()
  balance: number;
}
