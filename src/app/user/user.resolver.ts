import { Query, Resolver } from '@nestjs/graphql';

@Resolver('User')
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'Hello world';
  }
}
