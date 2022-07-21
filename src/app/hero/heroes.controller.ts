import { Controller, OnModuleInit } from '@nestjs/common';
import {
  Client,
  ClientKafka,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';

@Controller('heroes')
export class HeroesController implements OnModuleInit {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'hero',
        brokers: ['localhost:9094'],
      },
      consumer: {
        groupId: 'hero-consumer',
      },
    },
  })
  client: ClientKafka;

  async onModuleInit() {
    this.client.subscribeToResponseOf('hero.kill.dragon');
    await this.client.connect();
  }

  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: any) {
    console.log("MessagePattern('hero.kill.dragon')");
    console.log('------------', message.value);
  }

  @MessagePattern('hero.kill.dragon')
  kill2Dragon(@Payload() message: any) {
    console.log("MessagePattern('hero.kill2.dragon')");
    console.log('------------', message.value);
  }

  @MessagePattern('hero.atk.dragon')
  atkDragon(@Payload() message: any) {
    console.log("MessagePattern('hero.atk.dragon')");
    console.log('------------', message.value);
  }
}
