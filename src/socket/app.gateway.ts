import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'ws';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { RedisIoEmitter } from './emitter/redis.io.emitter';

@WebSocketGateway(3333, {
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  /**
   * logger
   * @private
   */
  private readonly logger = new Logger(this.constructor.name);

  /**
   * @param socketService
   */
  constructor(private readonly socketService: SocketService) {
    this.server = RedisIoEmitter.create();
  }

  afterInit(server: Server) {
    this.socketService.server = server;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected SocketConsumer: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.socketService.delClientId(client.id);
    this.logger.log(`Client disconnected SocketConsumer: ${client.id}`);
  }

  @SubscribeMessage('identity')
  identity(client: Socket, token) {
    if (token) {
      this.socketService.setClientId(client.id, token);
    } else {
      this.socketService.delClientId(client.id);
    }
  }

  /**
   * ROOM Server Handle message client
   * @param client
   * @param room
   */
  // Client yêu cầu tham gia => kết nối room và gửi xác nhận
  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, room: string) {
    await client.join(room);
    client.emit('joinedRoom', '0k');
    return room;
  }

  /**
   * Rời room của 1 client
   * @param client
   * @param room
   */
  @SubscribeMessage('leaveRoom')
  async leaveRoom(client: Socket, room: string) {
    await client.leave(room);
    return room;
  }
}
