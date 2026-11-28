import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
import { GetCurrentHouseMatchQuery } from './get-current-house-match.query';

@QueryHandler(GetCurrentHouseMatchQuery)
export class GetCurrentHouseMatchHandler
  implements IQueryHandler<GetCurrentHouseMatchQuery>
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
