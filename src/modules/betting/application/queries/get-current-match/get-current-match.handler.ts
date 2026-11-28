import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
import { GetCurrentMatchQuery } from './get-current-match.query';

@QueryHandler(GetCurrentMatchQuery)
export class GetCurrentMatchHandler
  implements IQueryHandler<GetCurrentMatchQuery>
{
  constructor(
    @Inject(HOUSE_MATCH_REPOSITORY)
    private readonly houseMatches: HouseMatchRepository,
  ) {}

  async execute() {
    const match = await this.houseMatches.findCurrent();
    return match ? match.toPublic() : null;
  }
}
