import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, HttpException, HttpStatus } from '@nestjs/common';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { DeductBalanceCommand } from './deduct-balance.command';

@CommandHandler(DeductBalanceCommand)
export class DeductBalanceHandler
  implements ICommandHandler<DeductBalanceCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: DeductBalanceCommand): Promise<number> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.deductBalance(command.amount); // throws InsufficientFundsException if insufficient
    await this.userRepository.save(user);
    return user.getBalance();
  }
}
