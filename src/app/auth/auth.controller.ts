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
  ApiBearerAuth,
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
import { ILoginResDto } from './dto/login.res.dto';

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

  @Post('sign-in')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'Login successfully.' })
  @UsePipes(ValidationPipe)
  login(@Body() user: LoginReqDto): Observable<ILoginResDto> {
    return this.authService.login(user).pipe(map((res: ILoginResDto) => res));
  }

  @Post('logout')
  public logout(): void {
    // req.logout();
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile' })
  @ApiResponse({ status: 200, description: 'Profile successfully.' })
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.profile(req.user.id);
  }
}
