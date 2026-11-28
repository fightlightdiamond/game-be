import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { User } from '../../../domain/aggregates/user.aggregate';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { PasswordHasher } from '../../../domain/services/password-hasher.service';
import { RegisterUserCommand } from './register-user.command';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const passwordHash = await this.passwordHasher.hash(command.password);
    const user = User.create(0, command.email, passwordHash);
    return this.userRepository.save(user);
  }
}
