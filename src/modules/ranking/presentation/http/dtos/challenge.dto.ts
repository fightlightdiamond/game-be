import { IsNumber } from 'class-validator';

export class ChallengeDto {
  @IsNumber()
  competitor_id: number;
}
