import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import ISocketQueueContract from '../common/contracts/socket-queue.contract';
import { NameQueueConstant } from '../common/constants/name-queue.constant';
import { SocketService } from './socket.service';

@Processor('socket.io')
export class SocketConsumer {
  constructor(private readonly socketService: SocketService) {}

  @Process()
  handleMessageEmitClient(job: Job): void {
    const data = job.data;
    console.log('sendDataToRoom....', data);
    this.socketService.server.to(data.room).emit(data.sender, {
      message: data,
    });
  }

  @Process(NameQueueConstant.ROOM_QUEUE)
  betRom(job: Job): void {
    const data: ISocketQueueContract = job.data;
    console.log('ROOM_QUEUE....', data);
    this.socketService.server.to(data.room).emit(data.event, data.data);
  }
}
