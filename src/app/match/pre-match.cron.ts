import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import ISocketQueueContract from '../../common/contracts/socket-queue.contract';
import { NameQueueConstant } from '../../common/constants/name-queue.constant';
import { MatchRepository } from './match.repository';
import { MatchService } from './match.service';

@Injectable()
export class PreMatchCron {
  constructor(
    @InjectQueue('socket.io') private readonly queue: Queue,
    @InjectQueue('bet') private betQueue: Queue,
    private readonly matchRepository: MatchRepository,
    private readonly matchService: MatchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // @Cron('0 */10 * * * *')
  @Cron('0 */3 * * * *')
  async execute() {
    const match = await this.matchService.bet();

    await this.cacheManager.set('currentMatchId', match.id, 1000 * 60 * 3);

    // await this.matchRepository.update(
    //   { id: match.id },
    //   {
    //     status: BetStatusConstant.BETTING,
    //   },
    // );

    match.status = BetStatusConstant.BETTING;
    const data: ISocketQueueContract = {
      event: 'betting',
      room: 'match',
      data: match,
    };

    await this.queue.add(NameQueueConstant.ROOM_QUEUE, data);

    await this.betQueue.add(
      NameQueueConstant.FIGHT_QUEUE,
      {
        id: match.id,
      },
      { delay: 1000 * 60 }, // 1 m delayed
    );

    await this.betQueue.add(
      NameQueueConstant.REWARD_QUEUE,
      {
        id: match.id,
      },
      { delay: 1000 * 60 * 3 }, // 3 m delayed
    );
  }
}
