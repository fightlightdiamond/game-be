import { Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from 'nestjs-redis';
import { redisConfigAsync } from '../../../config/redis.config';

@Module({
  imports: [NestRedisModule.forRootAsync(redisConfigAsync)],
  exports: [NestRedisModule],
})
export class SharedRedisModule {}
