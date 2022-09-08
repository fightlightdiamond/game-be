import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BetRepository } from '../bet/bet.repository';
import { MatchRepository } from '../match/match.repository';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import { UserRepository } from '../user/user.repository';
import { NameQueueConstant } from '../../common/constants/name-queue.constant';
import { UserGemService } from '../user-gem/user-gem.service';

@Injectable()
export class RewardService {
  constructor(
    private readonly betRepository: BetRepository,
    private readonly matchRepository: MatchRepository,
    private readonly userRepository: UserRepository,
    private readonly userGemService: UserGemService,
    @InjectQueue('socket.io') private readonly queue: Queue,
  ) {}

  /**
   * TODO: chưa test
   */
  async execute(id: number) {
    const match = await this.matchRepository.findOne({
      where: {
        id: id,
      },
    });

    const { winner } = match;

    console.log({ winner, id });

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
      select: ['user_id', 'balance', 'match_id', 'hero_id'],
    });

    console.log({ bets });

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
            balance: () => `balance + ${bet.balance * 2}`,
          },
        ),
      );
      if (this.userGemService.isDropGem()) {
        ps.push(this.userGemService.add(bet.user_id));
        console.log(
          `-------    User has id:${bet.user_id} earned gem    --------`,
        );
      }
    }
    await Promise.all(ps);

    await this.queue.add(NameQueueConstant.ROOM_QUEUE, {
      room: 'all',
      event: 'reward',
      data: bets,
    });
  }
}
