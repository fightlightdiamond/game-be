import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
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
}
