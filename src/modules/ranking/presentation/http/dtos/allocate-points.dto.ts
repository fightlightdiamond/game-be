import { IsNumber, Min } from 'class-validator';

export class AllocatePointsDto {
  @IsNumber()
  @Min(0)
  atk_point: number;

  @IsNumber()
  @Min(0)
  def_point: number;

  @IsNumber()
  @Min(0)
  hp_point: number;

  @IsNumber()
  @Min(0)
  spd_point: number;

  @IsNumber()
  @Min(0)
  crit_rate_point: number;
}
