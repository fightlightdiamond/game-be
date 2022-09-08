import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, IsString, Max, Min } from 'class-validator';
import { GemLevelUpConstant } from '../constants/gem-level-up.constant';
import { GemTypeConstant } from '../constants/gem-type.constant';

export class LevelUpGemDto {
  @ApiProperty({
    description: 'Level of gems you want to up',
    default: 1,
    required: true,
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  level: number;

  @ApiProperty({ description: 'Gems type', required: true })
  @IsString()
  @IsIn(Object.values(GemTypeConstant))
  type: string;

  @ApiProperty({
    description: 'Number of gems you want to use for level up',
    default: 10,
    required: true,
  })
  @IsNumber()
  @IsInt()
  @Min(GemLevelUpConstant.MIN_GEMS)
  @Max(GemLevelUpConstant.MAX_GEMS)
  number: number;
}
