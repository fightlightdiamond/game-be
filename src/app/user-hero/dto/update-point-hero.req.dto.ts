import { IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePointHeroReqDto {
  @ApiProperty({
    description: 'The atk_point id',
    example: 1,
  })
  @IsNotEmpty()
  @Min(0)
  atk_point: number;

  @ApiProperty({
    description: 'The def_point id',
    example: 1,
  })
  @IsNotEmpty()
  @Min(0)
  def_point: number;

  @ApiProperty({
    description: 'The hp_point id',
    example: 1,
  })
  @IsNotEmpty()
  @Min(0)
  hp_point: number;

  @ApiProperty({
    description: 'The spd_point id',
    example: 1,
  })
  @IsNotEmpty()
  @Min(0)
  spd_point: number;

  @ApiProperty({
    description: 'The crit_rate_point id',
    example: 1,
  })
  @IsNotEmpty()
  @Min(0)
  crit_rate_point: number;
}
