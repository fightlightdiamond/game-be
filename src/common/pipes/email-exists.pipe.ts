import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UserRepository } from '../../app/user/user.repository';

@Injectable()
export class EmailExistsPipe implements PipeTransform {
  constructor(private userRepository: UserRepository) {}

  async transform(value: string) {
    try {
      await this.userRepository.findOneByOrFail({
        email: value,
      });
    } catch (e) {
      throw new BadRequestException('User not found');
    }

    return value;
  }
}
