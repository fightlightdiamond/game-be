import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bull';
import RedisConfig from './redis.config';

export default class QueueConfig {
  static getConfig(configService: ConfigService): QueueOptions {
    return {
      // redis: RedisConfig.getConfig(configService),
      redis: RedisConfig.getConfig(configService),
    };
  }
}

export const queueConfigAsync: any = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): QueueOptions =>
    QueueConfig.getConfig(configService),
};
