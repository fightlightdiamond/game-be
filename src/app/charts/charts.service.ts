import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class ChartsService {
  constructor(private readonly userRepository: UserRepository) {}

  async gold() {
    return this.userRepository.find({
      take: 100,
      order: {
        balance: 'DESC',
      },
      select: ['id', 'email', 'avatar', 'balance', 'lastName', 'firstName'],
    });
  }
}
