import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import ISocketQueueContract from '../../common/contracts/socket-queue.contract';
import { NameQueueConstant } from '../../common/constants/name-queue.constant';
import { RoundService } from '../round/round.service';

@Injectable()
export class PreMatchCron {
  constructor(
    @InjectQueue('socket.io') private readonly socketQueue: Queue,
    @InjectQueue('bet') private betQueue: Queue,
    private readonly roundService: RoundService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Cron('0 */3 * * * *')
  async execute() {
    const match = await this.roundService.bet();

    /**
     * Cache current match ID
     */
    await this.cacheManager.set('currentMatchId', match.id, 1000 * 60 * 3);

    match.status = BetStatusConstant.BETTING;
    const data: ISocketQueueContract = {
      event: 'betting',
      room: 'match',
      data: match,
    };

    /**
     * BET
     */
    await this.socketQueue.add(NameQueueConstant.ROOM_QUEUE, data);

    /**
     * FIGHT
     */
    await this.betQueue.add(
      NameQueueConstant.FIGHT_QUEUE,
      {
        id: match.id,
      },
      { delay: 1000 * 60 }, // 1 m delayed
    );

    /**
     * REWARD
     */
    await this.betQueue.add(
      NameQueueConstant.REWARD_QUEUE,
      {
        id: match.id,
      },
      { delay: 1000 * 60 * 3 }, // 3 m delayed
    );
  }
}
