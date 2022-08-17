import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePointHeroReqDto {
  @ApiProperty({
    description: 'The atk_plus id',
    example: 1,
  })
  @IsNotEmpty()
  atk_plus: number;

  @ApiProperty({
    description: 'The def_plus id',
    example: 1,
  })
  @IsNotEmpty()
  def_plus: number;

  @ApiProperty({
    description: 'The hp_plus id',
    example: 1,
  })
  @IsNotEmpty()
  hp_plus: number;

  @ApiProperty({
    description: 'The spd_plus id',
    example: 1,
  })
  @IsNotEmpty()
  spd_plus: number;
}
