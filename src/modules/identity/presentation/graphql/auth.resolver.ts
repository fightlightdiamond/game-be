import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from '../../application/commands/login/login.command';
import { RegisterAccountCommand } from '../../application/commands/register-account/register-account.command';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Query(() => String)
  hello() {
    return 'Hello world';
  }

  @Mutation(() => String, { nullable: true })
  async signIn(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    const result = await this.commandBus.execute(
      new LoginCommand(email, password),
    );
    return result.token;
  }

  @Mutation(() => String, { nullable: true })
  async signup(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    await this.commandBus.execute(new RegisterAccountCommand(email, password));
    return 'registered';
  }
}
