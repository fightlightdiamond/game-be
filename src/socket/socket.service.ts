import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { SocketId } from 'socket.io-adapter';
import _ from 'lodash';

type Target = number | string;

@Injectable()
export class SocketService {
  server: Server;
  private clientIdMap: { [key: string]: { target: Target } } = {};

  getClientIds(target: Target) {
    return _.reduce(
      this.clientIdMap,
      (result, val, clientId) => {
        if (target == val.target) {
          result.push(clientId);
        }
        return result;
      },
      [] as SocketId[],
    );
  }

  setClientId(id: SocketId, target: Target) {
    this.clientIdMap[id] = { target };
  }

  delClientId(id: SocketId) {
    delete this.clientIdMap[id];
  }
}
