import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { SocketGateway } from './socket.gateway';
import { SocketConsumer } from './socket.consumer';

@Module({
  imports: [CqrsModule, BullModule.registerQueue({ name: 'socket.io' })],
  providers: [SocketGateway, SocketConsumer],
  exports: [SocketGateway],
})
export class SocketModule {}
