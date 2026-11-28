import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IUserHeroRepository,
  USER_HERO_REPOSITORY,
} from '../../../domain/repositories/user-hero.repository.interface';
import { GetUserHeroQuery } from './get-user-hero.query';

@QueryHandler(GetUserHeroQuery)
export class GetUserHeroHandler implements IQueryHandler<GetUserHeroQuery> {
  constructor(
    @Inject(USER_HERO_REPOSITORY)
    private readonly userHeroRepo: IUserHeroRepository,
  ) {}

  async execute(query: GetUserHeroQuery) {
    return this.userHeroRepo.findByUserId(query.userId);
  }
}
