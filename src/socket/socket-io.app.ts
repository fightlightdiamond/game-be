import { NestFactory } from '@nestjs/core';
import { SocketModule } from './socket.module';
import { RedisIoAdapter } from './adapter/redis.io.adapter';

void (async function bootstrap() {
  const app = await NestFactory.create(SocketModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);
  app.enableCors();
  await app.listen(3033);
  console.log(`Application is running on: ${await app.getUrl()}`);
})();
