import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterAccountCommand } from '../../application/commands/register-account/register-account.command';
import { LoginCommand } from '../../application/commands/login/login.command';
import { GetAccountQuery } from '../../application/queries/get-account/get-account.query';
import { JwtGuard } from '../../infrastructure/auth/jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('sign-up')
  @ApiCreatedResponse({ description: 'User registered successfully.' })
  async register(@Body() body: { email: string; password: string }) {
    return this.commandBus.execute(
      new RegisterAccountCommand(body.email, body.password),
    );
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'Login successfully.' })
  async login(@Body() body: { email: string; password: string }) {
    return this.commandBus.execute(new LoginCommand(body.email, body.password));
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile' })
  @ApiResponse({ status: 200, description: 'Profile successfully.' })
  @Get('profile')
  async getProfile(@Request() req) {
    return this.queryBus.execute(new GetAccountQuery(req.user.id));
  }
}
