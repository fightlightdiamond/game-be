import { ApiProperty } from '@nestjs/swagger';

export class PaginateReqDto {
  @ApiProperty({
    description: 'The number page of match',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'The number limit of match',
    example: 100,
  })
  limit: string;
}
