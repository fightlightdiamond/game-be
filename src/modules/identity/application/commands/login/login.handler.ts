import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { PasswordHasher } from '../../../domain/services/password-hasher.service';
import { LoginCommand } from './login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async execute(command: LoginCommand): Promise<{ token: string }> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.NOT_FOUND);
    }
    const valid = await this.passwordHasher.compare(
      command.password,
      user.getPasswordHash(),
    );
    if (!valid) {
      throw new HttpException('Password incorrect', HttpStatus.UNAUTHORIZED);
    }
    const token = await this.jwtService.signAsync(
      { user: { id: user.id, email: user.getEmail(), role: user.role } },
      { secret: this.config.get<string>('JWT_SECRET') },
    );
    return { token };
  }
}
