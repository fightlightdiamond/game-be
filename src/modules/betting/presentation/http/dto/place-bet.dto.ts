import { IsNumber } from 'class-validator';

export class PlaceBetDto {
  @IsNumber()
  match_id: number;

  @IsNumber()
  hero_id: number;

  @IsNumber()
  amount: number;
}
