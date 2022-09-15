import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DataSource } from 'typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from 'nestjs-redis';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeormConfigAsync } from './config/typeorm.config';
import GraphqlConfig from './config/graphql.config';
import { TypeormModule } from './core/typeorm/typeorm.module';
import { UserRepository } from './app/user/user.repository';
import { UserService } from './app/user/user.service';
import { ConfirmEmailService } from './app/user/email/confirm-email.service';
import { jwtConfigAsync } from './config/jwt.config';
import { AuthTokenRepository } from './app/auth/auth-token/auth-token.repository';
import { AuthService } from './app/auth/auth.service';
import { JwtAuthGuard } from './app/auth/guards/jwt.strategy.guard';
import { JwtGuard } from './app/auth/guards/jwt.guard';
import { RolesGuard } from './app/auth/guards/roles.guard';
import { AuthTokenService } from './app/auth/auth-token/auth-token.service';
import { GqlAuthGuard } from './app/auth/guards/gql-auth.guard';
import { AuthController } from './app/auth/auth.controller';
import { AuthResolver } from './app/auth/auth.resolver';
import { HeroRepository } from './app/hero/hero.repository';
import { AddressRepository } from './app/user/address/address.repository';
import { MatchController } from './app/match/match.controller';
import { MatchRepository } from './app/match/match.repository';
import { MatchService } from './app/match/match.service';
import { HeroEntity } from './migrations/entities/hero.entity';
import { BetController } from './app/bet/bet.controller';
import { BetService } from './app/bet/bet.service';
import { BetRepository } from './app/bet/bet.repository';
import { UserHeroRepository } from './app/user-hero/user-hero.repository';
import { UserHeroController } from './app/user-hero/user-hero.controller';
import { UserHeroService } from './app/user-hero/user-hero.service';
import { queueConfigAsync } from './config/queue.config';
import { MatchEntity } from './migrations/entities/match.entity';
import { BetEntity } from './migrations/entities/bet.entity';
import { UserEntity } from './migrations/entities/user.entity';
import { MatchExistsRule } from './common/rules/match-exists.rule';
import { HeroExistsRule } from './common/rules/hero-exists.rule';
import { UserExistsRule } from './common/rules/user-exists.rule';
import { PreMatchCron } from './app/match/pre-match.cron';
import { FightingService } from './app/match/fighting.service';
import { BetConsumer } from './app/bet/bet.consumer';
import { RewardService } from './app/reward/reward.service';
import { StatisticMatchController } from './app/match/statistic-match.controller';
import { ChartsService } from './app/charts/charts.service';
import { ChartsController } from './app/charts/charts.controller';
import { HeroController } from './app/hero/hero.controller';
import { HeroService } from './app/hero/hero.service';
import { MasterController } from './master/master.controller';
import { MasterService } from './master/master.service';
import { RoundController } from './app/round/round.controller';
import { TreeController } from './app/tree/tree.controller';
import { TreeRepository } from './app/tree/tree.repository';
import { TreeEntity } from './migrations/entities/tree.entity';
import { TreeService } from './app/tree/tree.service';
import { RoundService } from './app/round/round.service';
import { EloMatchService } from './app/elo-match/elo-match.service';
import { redisConfigAsync } from './config/redis.config';
import { EloMatchController } from './app/elo-match/elo-match.controller';
import { UserHeroExistsRule } from './common/rules/user-hero-exists.rule';
import { UserGemController } from './app/user-gem/user-gem.controller';
import { UserGemService } from './app/user-gem/user-gem.service';
import { GemIdsUniqueRule } from './common/rules/gem-ids-unique.rule';
import { EloMatchRepository } from './app/elo-match/elo-match.repository';
import { UserGemRepository } from './app/user-gem/user-gem.repository';
import { UserGemEntity } from './migrations/entities/user-gem.entity';
import { IsKeyValueValidate } from './core/validator/iskeyvalue-validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    //Cron
    ScheduleModule.forRoot(),
    //Queue
    BullModule.forRootAsync(queueConfigAsync),
    BullModule.registerQueue({
      name: 'socket.io',
    }),
    BullModule.registerQueue({
      name: 'bet',
    }),
    // Cache
    CacheModule.register(),
    //Event
    EventEmitterModule.forRoot(),
    // Mysql
    TypeOrmModule.forRootAsync(typeormConfigAsync),
    // Authentication
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync(jwtConfigAsync),
    //Graph QL
    GraphQLModule.forRoot<ApolloDriverConfig>(GraphqlConfig.getConfig()),
    // Mail
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
    TypeormModule.forCustomRepository([
      AddressRepository,
      AuthTokenRepository,
      BetRepository,
      UserRepository,
      HeroRepository,
      MatchRepository,
      UserHeroRepository,
      TreeRepository,
      EloMatchRepository,
      UserGemRepository,
    ]),
    TypeOrmModule.forFeature([
      HeroEntity,
      MatchEntity,
      BetEntity,
      UserEntity,
      UserGemEntity,
      TreeEntity,
    ]),
    //Redis
    RedisModule.forRootAsync(redisConfigAsync),
  ],
  controllers: [
    AppController,
    AuthController,
    BetController,
    ChartsController,
    MatchController,
    StatisticMatchController,
    UserHeroController,
    HeroController,
    TreeController,
    MasterController,
    RoundController,
    EloMatchController,
    UserGemController,
  ],
  providers: [
    AppService,
    ConfirmEmailService,
    UserService,

    // Auth
    JwtService,
    AuthService,
    JwtAuthGuard,
    // LocalStrategy,
    JwtGuard,
    RolesGuard,
    AuthTokenService,
    GqlAuthGuard,
    AuthResolver,
    MatchService,

    BetService,
    UserHeroService,

    //Cron
    PreMatchCron,

    //Bet
    FightingService,
    RewardService,

    //Consumer
    BetConsumer,

    //Validate
    MatchExistsRule,
    HeroExistsRule,
    UserExistsRule,
    GemIdsUniqueRule,
    UserHeroExistsRule,
    IsKeyValueValidate,

    ChartsService,
    HeroService,
    TreeService,

    MasterService,
    RoundService,
    EloMatchService,

    UserGemService,
  ],
  exports: [MatchService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
