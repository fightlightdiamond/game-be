import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';
import { MatchEntity } from '../../migrations/entities/match.entity';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import ISocketQueueContract from '../../common/contracts/socket-queue.contract';
import { NameQueueConstant } from '../../common/constants/name-queue.constant';
import { MatchRepository } from './match.repository';

@Injectable()
export class MatchService {
  home: IMatchLog;
  away: IMatchLog;
  round = 1;
  match: MatchEntity;

  constructor(
    @InjectQueue('socket.io') private readonly queue: Queue,
    private readonly matchRepository: MatchRepository,
  ) {}

  @Cron('0 */10 * * * *')
  async execute() {
    const match = await this.matchRepository.findOne({
      where: { status: BetStatusConstant.PENDING },
      select: ['id', 'hero_info'],
    });

    if (!match) {
      console.log('Not found match', match);
      return;
    }

    await this.matchRepository.update(
      { id: match.id },
      {
        status: BetStatusConstant.BETTING,
      },
    );

    const data: ISocketQueueContract = {
      event: 'pre-bet',
      room: 'match',
      data: match,
    };

    await this.queue.add(NameQueueConstant.ROOM_QUEUE, data);

    console.log('betting', match);
  }
}
