import { Emitter } from '@socket.io/redis-emitter';
import { createClient } from 'redis';

/**
 * RedisIoEmitter
 */
export class RedisIoEmitter {
  static create() {
    const redisClient = createClient({ url: 'redis://localhost:6379' });
    return new Emitter(redisClient);
  }
}
