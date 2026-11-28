import { IsIn, IsNumber, Min } from 'class-validator';
import { GEM_TYPES, GemType } from '../../../domain/gem';

export class LevelUpGemDto {
  @IsIn(GEM_TYPES)
  type: GemType;

  @IsNumber()
  @Min(1)
  level: number;

  @IsNumber()
  @Min(1)
  spent: number;
}
