import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron } from '@nestjs/schedule';
import { BetRepository } from '../bet/bet.repository';
import { MatchRepository } from '../match/match.repository';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import { UserRepository } from '../user/user.repository';
import { NameQueueConstant } from '../../common/constants/name-queue.constant';

@Injectable()
export class RewardCron {
  constructor(
    private readonly betRepository: BetRepository,
    private readonly matchRepository: MatchRepository,
    private readonly userRepository: UserRepository,
    @InjectQueue('socket.io') private readonly queue: Queue,
  ) {}

  /**
   * TODO: chưa test
   */
  @Cron('0 8,*/10 * * * *')
  async endMatch() {
    const match = await this.matchRepository.findOne({
      where: {
        status: BetStatusConstant.FIGHTING,
      },
    });

    const { id, winner } = match;

    if (match) {
      await this.matchRepository.update(
        { id: match.id },
        {
          status: BetStatusConstant.END,
        },
      );

      const bets = await this.betRepository.find({
        where: {
          match_id: id,
          hero_id: winner,
        },
        select: ['user_id', 'balance'],
      });

      /**
       * TODO: sau này cần chuyển qua update switch case
       */
      const ps = [];
      for (const bet of bets) {
        ps.push(
          this.userRepository.update(
            {
              id: bet.user_id,
            },
            {
              balance: () => `balance + ${bet.user_id * 2}`,
            },
          ),
        );
      }
      await Promise.all(ps);

      await this.queue.add(NameQueueConstant.ROOM_QUEUE, {
        room: 'all',
        event: 'reward',
        data: bets,
      });
    }
  }
}
