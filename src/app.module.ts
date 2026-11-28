import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Shared infrastructure
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { QueueModule } from './shared/infrastructure/queue/queue.module';
import { SharedRedisModule } from './shared/infrastructure/redis/redis.module';
import { SocketModule } from './shared/infrastructure/socket/socket.module';

// Feature modules
import { IdentityModule } from './modules/identity/identity.module';
import { HeroCatalogModule } from './modules/hero-catalog/hero-catalog.module';
import { CombatModule } from './modules/combat/combat.module';
import { BettingModule } from './modules/betting/betting.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { LedgerModule } from './modules/ledger/ledger.module';

// Config
import GraphqlConfig from './config/graphql.config';

@Module({
  imports: [
    // Global config
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // Scheduling
    ScheduleModule.forRoot(),
    // Cache (used by GetCurrentMatchQuery via Redis cache)
    CacheModule.register({ isGlobal: true }),
    // Event emitter (required for @nestjs/cqrs EventBus integration)
    EventEmitterModule.forRoot(),
    // GraphQL (keep same config as before)
    GraphQLModule.forRoot<ApolloDriverConfig>(GraphqlConfig.getConfig()),
    // Mail (keep for email verification feature)
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
      defaults: { from: '"nest-modules" <modules@nestjs.com>' },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
    // Shared infrastructure
    DatabaseModule,
    QueueModule,
    SharedRedisModule,
    SocketModule,
    // Feature bounded contexts
    IdentityModule,
    LedgerModule,
    HeroCatalogModule,
    CombatModule,
    BettingModule,
    RankingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
