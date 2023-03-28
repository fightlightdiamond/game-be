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
   * Player
   */
  player: any = {};
  pickItem: any[] = [];
  doneItem: any[] = [];

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
    this.player[client.id] = {};
    client.emit('joinedRoom', room);
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

  @SubscribeMessage('pick')
  pick(client: Socket, item_id: number) {
    console.log('Pick', item_id, this.pickItem);
    // if (this.pickItem.includes(item_id) === false) {
    this.player[client.id].item_id = item_id;
    this.pickItem.push(item_id);
    client.broadcast.emit('picked', this.player[client.id]);
    // }
  }

  @SubscribeMessage('move')
  move(client: Socket, data: IData) {
    this.player[client.id] = client.id;
    this.player[client.id] = { ...this.player[client.id], ...data };
    client.broadcast.emit('moving', this.player[client.id]);
    return data;
  }

  @SubscribeMessage('done')
  done(client: Socket, item_id: number) {
    console.log({ item_id }, this.doneItem, this.pickItem);
    this.doneItem.push({ item_id, client_id: client.id });
    this.player[client.id] = {};
    client.broadcast.emit('hadDone', this.player[client.id]);

    if (this.doneItem.length > 3) {
      client.broadcast.emit('finish', this.player[client.id]);
      this.doneItem = [];
      this.pickItem = [];
    }
  }
}

interface IData {
  x: number;
  y: number;
  socket_id?: string;
  item_id?: string;
  is_done?: false;
}
// interface IDone {
//   socket_id?: string;
//   item_id?: string;
//   is_done?: false;
// }

// interface gameInfo {
//   socket_id: {
//     item_id: {
//       x: number;
//       y: number;
//       is_done?: false;
//     }
//   }
// }
