import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { MatchRepository } from '../match/match.repository';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import { BetRepository } from './bet.repository';

@Injectable()
export class BetService {
  constructor(
    private readonly betRepository: BetRepository,
    private readonly userRepository: UserRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async bet(body) {
    const match = await this.matchRepository.findOne({
      where: {
        id: body.match_id,
      },
    });

    if (match.status !== BetStatusConstant.BETTING) {
      throw new HttpException('Match illegal', HttpStatus.CONFLICT);
    }

    /**
     * TODO:
     *  - Validate chỉ có thể bet khi Match chưa bắt đầu trận đấu
     *  -
     */
    const user = await this.userRepository.findOne({
      where: {
        id: body.user_id,
      },
      select: ['id', 'balance'],
    });

    //  Validate số tiền không được quá số tiền hiện có
    if (user.balance < body.balance) {
      throw new HttpException('Balance not enoughn', HttpStatus.CONFLICT);
    }

    await this.userRepository.update(
      {
        id: body.user_id,
      },
      {
        balance: () => `balance - ${body.balance}`,
      },
    );

    return this.betRepository.save(body);
  }
}
