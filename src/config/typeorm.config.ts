import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export default class TypeormConfig {
  static getOrmConfig(config: ConfigService): TypeOrmModuleOptions {
    console.log(config.get<string>('DB_USERNAME'));
    return {
      type: 'mysql',
      host: config.get<string>('DB_HOST'),
      port: config.get<number>('DB_PORT'),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      database: config.get<string>('DB_DATABASE'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
      logging: true,
      extra: {
        connectionLimit: 50,
      },
    };
  }
}

export const typeormConfigAsync: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService): TypeOrmModuleOptions =>
    TypeormConfig.getOrmConfig(config),
};
