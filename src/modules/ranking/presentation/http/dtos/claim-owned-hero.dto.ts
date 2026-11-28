import { IsNumber } from 'class-validator';

export class ClaimOwnedHeroDto {
  @IsNumber()
  heroId: number;
}
