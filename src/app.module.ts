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
import { HeroSchema } from './app/hero/hero.schema';
import { HeroesEntity } from './app/hero/heroes.entity';
import { UserEntity } from './app/user/user.entity';

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
      transport:
        'smtps://phamminhcuong1704bnfrv@gmail.com:vincent1704BN@smtp.gmail.com',
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
      UserRepository,
      UserRepository,
      AuthTokenRepository,
    ]),
    TypeOrmModule.forFeature([HeroesEntity, UserEntity, HeroSchema]),
  ],
  controllers: [AppController, AuthController],
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
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
