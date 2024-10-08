import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { queueConfigAsync } from '../config/queue.config';
import { SocketService } from './socket.service';
import { AppGateway } from './app.gateway';
import { SocketConsumer } from './socket.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    BullModule.forRootAsync(queueConfigAsync),
    BullModule.registerQueue({
      name: 'socket.io',
    }),
  ],
  providers: [AppGateway, SocketService, SocketConsumer],
  exports: [SocketService],
  controllers: [],
})
export class SocketModule {}
