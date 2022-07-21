import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePipes } from '@nestjs/common';
import * as yup from 'yup';
import { map, Observable } from 'rxjs';
import { YupValidationPipe } from '../../common/pipes/yup-validation.pipe';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { ErrorResponse } from './shared/errorResponse';
import { SignupInput } from './input/signup.input';
import { LoginInput } from './input/login.input';
import { AuthService } from './auth.service';
import { LoginResponse } from './shared/loginResponse';

const signupInputSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(3).max(150).required(),
});

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => String)
  hello() {
    return 'Hello world';
  }

  @Mutation(() => [ErrorResponse], { nullable: true })
  @UsePipes(new YupValidationPipe(signupInputSchema))
  async signup(
    @Args('signupInput') signupInput: SignupInput,
  ): Promise<ErrorResponse[] | null> {
    return this.userService.signup(signupInput);
  }

  @Mutation(() => [ErrorResponse] || String, { nullable: true })
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<ErrorResponse[] | string> {
    try {
      const res = await this.userService.login(loginInput);
      console.log({ res });
      return res;
    } catch (e) {
      return 'error';
    }
  }

  @Mutation(() => LoginResponse || String, {
    nullable: true,
  })
  signIn(
    @Args('loginInput') loginInput: LoginInput,
  ): Observable<{ token: string }> | string {
    try {
      const u = new UserEntity();
      u.email = loginInput.email;
      u.password = loginInput.password;
      return this.authService
        .login(u)
        .pipe(map((jwt: string) => ({ token: jwt })));
    } catch (e) {
      return 'error';
    }
  }

  // @Mutation(() => Boolean)
  // async logout(@Context() ctx: MyContext) {
  //   await ctx.req.session.destroy((err) => {
  //     console.log(err)
  //   })
  //
  //   // ctx.res.clearCookie('votinapp')
  //   return true
  // }
}
