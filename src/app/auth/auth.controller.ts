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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SETTING } from '../user/user.const';
import { UserEntity } from '../../migrations/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { RegisterReqDto } from './dto/register.req.dto';
import { LoginReqDto } from './dto/login.req.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  /**
   * Do User Registration
   * @param registerBody
   */
  @Post('/register')
  @ApiCreatedResponse({
    description: 'Created user object as response',
  })
  @ApiBadRequestResponse({
    description: 'User cannot register. Try again!',
  })
  @UsePipes(ValidationPipe)
  async doUserRegistration(
    @Body(SETTING.VALIDATION_PIPE)
    registerBody: RegisterReqDto,
  ): Promise<UserEntity> {
    return this.authService.register(registerBody);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'Login successfully.' })
  @UsePipes(ValidationPipe)
  login(@Body() user: LoginReqDto): Observable<{ token: string }> {
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
