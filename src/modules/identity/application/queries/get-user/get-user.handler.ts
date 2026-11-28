import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { User } from '../../../domain/aggregates/user.aggregate';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { GetUserQuery } from './get-user.query';

@QueryHandler(GetUserQuery)
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, User | null>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<User | null> {
    return this.userRepository.findById(query.userId);
  }
}
