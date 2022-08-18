import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UserRepository } from '../../app/user/user.repository';

@Injectable()
export class UserExistsPipe implements PipeTransform {
  constructor(private userRepository: UserRepository) {}

  async transform(value: any) {
    try {
      await this.userRepository.findOneByOrFail({
        id: value,
      });
    } catch (e) {
      throw new BadRequestException('User not found');
    }

    return value;
  }
}
