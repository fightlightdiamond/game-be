import { Emitter } from '@socket.io/redis-emitter';
import { createClient } from 'redis';

/**
 * RedisIoEmitter
 */
export class RedisIoEmitter {
  static create() {
    const redisClient = createClient({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    });
    return new Emitter(redisClient);
  }
}
