import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserHeroExists } from '../../../common/validators/user-hero-exists.validator';

export class FightEloMatchDto {
  @ApiProperty({
    description: 'The user hero id',
    example: 1,
  })
  @IsNotEmpty()
  @UserHeroExists()
  competitor: number;
}
