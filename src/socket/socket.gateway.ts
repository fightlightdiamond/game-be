import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  path: '',
  serveClient: true,
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('AppGateway');

  handleMessage(client: Socket, text: string): WsResponse<string> {
    return { event: 'chatToClient', data: text };
  }

  @SubscribeMessage('chatToServer')
  handleMessageEmitServer(
    client: Socket,
    message: { sender: string; message: string },
  ): void {
    this.wss.emit('chatToClient', message);
  }

  handleMessageEmit(client: Socket, text: string): void {
    client.broadcast.emit('chatToClient', text);
  }

  afterInit(server: Server): any {
    this.logger.log('Initialized!', server);
  }

  handleConnection(client: Socket): any {
    this.logger.log('Connected!', client.id);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log('Disconnected!', client.id);
  }
}
