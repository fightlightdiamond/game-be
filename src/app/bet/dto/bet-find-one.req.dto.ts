import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchExists } from '../../../common/validators/match-exists.validator';

export class BetFindOneReqDto {
  @ApiProperty({
    description: 'The match id',
    example: 1,
  })
  @IsNotEmpty()
  @MatchExists()
  match_id: number;
}
