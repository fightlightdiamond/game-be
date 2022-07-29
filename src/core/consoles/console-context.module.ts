import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { queueConfigAsync } from '../../config/queue.config';
import { EmailService } from '../email-service/email.service';
import { AfkConsole } from './afk-console';
import { SocketConsole } from './socket-console';
import { EmailConsole } from './email-console';

@Module({
  imports: [
    ConsoleModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    BullModule.forRootAsync(queueConfigAsync),
    BullModule.registerQueue({
      name: 'socket.io',
    }),
    MailerModule.forRoot({
      transport: {
        host: 'localhost',
        port: 1025,
        ignoreTLS: true,
        secure: false,
        auth: {
          user: process.env.MAILDEV_INCOMING_USER ?? 'MAILDEV_INCOMING_USER',
          pass: process.env.MAILDEV_INCOMING_PASS ?? 'MAILDEV_INCOMING_PASS',
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [AfkConsole, SocketConsole, EmailConsole, EmailService],
  exports: [],
})
export class ConsoleContextModule {}
