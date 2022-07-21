import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { UserEntity } from '../user/user.entity';
import { SETTING } from '../user/user.const';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { RegisterReqDto } from './dto/register.req.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  /**
   * Do User Registration
   * @param registerBody
   */
  @Post('/register')
  @UsePipes(ValidationPipe)
  async doUserRegistration(
    @Body(SETTING.VALIDATION_PIPE)
    registerBody: RegisterReqDto,
  ): Promise<UserEntity> {
    return this.authService.register(registerBody);
  }

  @Post('login')
  login(@Body() user: UserEntity): Observable<{ token: string }> {
    return this.authService
      .login(user)
      .pipe(map((jwt: string) => ({ token: jwt })));
  }

  @Post('logout')
  public logout(): void {
    // req.logout();
    // res.redirect('/api/feed');
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
