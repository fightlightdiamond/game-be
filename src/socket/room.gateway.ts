import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@WebSocketGateway({
  path: '',
  serveClient: true,
  cors: {
    origin: '*',
  },
  namespace: '/room',
})
export class RoomGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('RoomGateway');

  afterInit(server: Server): any {
    this.logger.log('Initialized!', server);
  }

  handleConnection(client: Socket): any {
    this.logger.log('Connected!', client.id);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log('Disconnected!', client.id);
  }

  @SubscribeMessage('chatToServer')
  handleMessageEmitServer(
    client: Socket,
    message: { sender: string; room: string; message: string },
  ): void {
    this.wss.to(message.room).emit('chatToClient', message);
  }

  @Cron('*/15 * * * * *')
  async sentClientRoom() {
    const size = await this.wss
      .in('room1')
      .allSockets()
      .then((data) => {
        return data.size;
      });
    this.wss
      .to('room1')
      .emit('chatToClient', new Date().toISOString() + ' ' + size);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, room: string) {
    await client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(client: Socket, room: string) {
    await client.leave(room);
    client.emit('leftRoom', room);
  }
}
