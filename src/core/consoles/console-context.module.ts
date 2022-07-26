import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { queueConfigAsync } from '../../config/queue.config';
import { AfkConsole } from './afk-console';
import { SocketConsole } from './socket-console';

@Module({
  imports: [
    ConsoleModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    BullModule.forRootAsync(queueConfigAsync),
    BullModule.registerQueue({
      name: 'socket.io',
    }),
  ],
  providers: [AfkConsole, SocketConsole],
  exports: [],
})
export class ConsoleContextModule {}
