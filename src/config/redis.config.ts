import { ConfigModule, ConfigService } from '@nestjs/config';

export interface IRedisConfig {
  host: string;
  port: number;
  username?: string; // needs Redis >= 6
  password?: string;
  db?: number; // Defaults to 0
}

export default class RedisConfig {
  static getConfig(configService: ConfigService): IRedisConfig {
    return {
      host: configService.get<string>('REDIS_HOST'),
      port: parseInt(configService.get<string>('REDIS_PORT')),
      // username: 'default', // needs Redis >= 6
      password: configService.get<string>('REDIS_PASSWORD'),
      db: 0, // Defaults to 0
    };
  }
}

export const redisConfigAsync: any = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): IRedisConfig =>
    RedisConfig.getConfig(configService),
};
