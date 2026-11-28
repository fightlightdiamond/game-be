import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { queueConfigAsync } from '../../../config/queue.config';

@Module({
  imports: [
    BullModule.forRootAsync(queueConfigAsync),
    BullModule.registerQueue({ name: 'socket.io' }),
    BullModule.registerQueue({ name: 'bet' }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
