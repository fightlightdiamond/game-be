import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { NameQueueConstant } from '../../constants/name-queue.constant';
import { SocketGateway } from './socket.gateway';

@Processor('socket.io')
@Injectable()
export class SocketConsumer {
  constructor(private readonly socketGateway: SocketGateway) {}

  @Process(NameQueueConstant.ROOM_QUEUE)
  async betRoom(
    job: Job<{ event: string; room: string; data: unknown }>,
  ): Promise<void> {
    const { event, room, data } = job.data;
    this.socketGateway.server?.to(room).emit(event, data);
  }
}
