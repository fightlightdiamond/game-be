import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { IMatchLog } from '../../migrations/interfaces/match-log.interface';
import { MatchEntity } from '../../migrations/entities/match.entity';
import { BetStatusConstant } from '../../common/constants/bet-status.constant';
import ISocketQueueContract from '../../common/contracts/socket-queue.contract';
import { NameQueueConstant } from '../../common/constants/name-queue.constant';
import { MatchRepository } from './match.repository';

@Injectable()
export class FightingService {
  home: IMatchLog;
  away: IMatchLog;
  round = 1;
  match: MatchEntity;

  constructor(
    @InjectQueue('socket.io') private readonly queue: Queue,
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(id: number) {
    const match = await this.matchRepository.findOne({
      where: { id },
      select: ['id', 'turns'],
    });

    if (!match) {
      throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
    }

    await this.matchRepository.update(
      { id: match.id },
      {
        status: BetStatusConstant.FIGHTING,
      },
    );

    const data: ISocketQueueContract = {
      event: 'matching',
      room: 'match',
      data: match,
    };

    await this.queue.add(NameQueueConstant.ROOM_QUEUE, data);
  }
}
