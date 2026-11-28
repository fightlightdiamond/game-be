import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  OwnedHeroRepository,
  OWNED_HERO_REPOSITORY,
} from '../../../domain/repositories/owned-hero.repository';
import { GetOwnedHeroQuery } from './get-owned-hero.query';

@QueryHandler(GetOwnedHeroQuery)
export class GetOwnedHeroHandler implements IQueryHandler<GetOwnedHeroQuery> {
  constructor(
    @Inject(OWNED_HERO_REPOSITORY)
    private readonly ownedHeroes: OwnedHeroRepository,
  ) {}

  async execute(query: GetOwnedHeroQuery) {
    return this.ownedHeroes.findByAccountId(query.accountId);
  }
}
