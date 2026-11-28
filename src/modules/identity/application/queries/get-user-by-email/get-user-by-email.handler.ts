import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { User } from '../../../domain/aggregates/user.aggregate';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { GetUserByEmailQuery } from './get-user-by-email.query';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
  implements IQueryHandler<GetUserByEmailQuery, User | null>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByEmailQuery): Promise<User | null> {
    return this.userRepository.findByEmail(query.email);
  }
}
