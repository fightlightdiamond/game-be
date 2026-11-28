import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, HttpException, HttpStatus } from '@nestjs/common';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { CreditBalanceCommand } from './credit-balance.command';

@CommandHandler(CreditBalanceCommand)
export class CreditBalanceHandler
  implements ICommandHandler<CreditBalanceCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreditBalanceCommand): Promise<number> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.creditBalance(command.amount);
    await this.userRepository.save(user);
    return user.getBalance();
  }
}
