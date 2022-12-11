import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';

export default class RedisConfig {
  static getConfig(configService: ConfigService): Redis.RedisOptions {
    return {
      host: configService.get<string>('REDIS_HOST'),
      port: parseInt(configService.get<string>('REDIS_PORT')),
      // username: 'default', // needs Redis >= 6
      password: configService.get<string>('REDIS_PASSWORD'),
      db: configService.get<number>('REDIS_DB'),
    };
  }
}

export const redisConfigAsync: any = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Redis.RedisOptions =>
    RedisConfig.getConfig(configService),
};
