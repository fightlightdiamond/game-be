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
import { LocalStrategy } from './app/auth/guards/local.strategy';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // Cache
    CacheModule.register(),
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
    ]),
    TypeOrmModule.forFeature([HeroEntity]),
  ],
  controllers: [
    AppController,
    AuthController,
    BetController,
    MatchController,
    UserHeroController,
  ],
  providers: [
    AppService,
    ConfirmEmailService,
    UserService,

    // Auth
    JwtService,
    AuthService,
    JwtAuthGuard,
    LocalStrategy,
    JwtGuard,
    RolesGuard,
    AuthTokenService,
    GqlAuthGuard,
    AuthResolver,
    MatchService,

    BetService,
    UserHeroService,
  ],
  exports: [MatchService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
