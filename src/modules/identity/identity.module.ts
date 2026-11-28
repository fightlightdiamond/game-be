import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { LedgerModule } from '../ledger/ledger.module';
import { SharedRedisModule } from '../../shared/infrastructure/redis/redis.module';
import { ACCOUNT_REPOSITORY } from './domain/repositories/account.repository';
import { CLOCK, SystemClock } from './domain/clock';
import { GRANTED_DAY } from './domain/granted-day';
import { AccountOrmEntity } from './infrastructure/persistence/typeorm/account.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm/user.repository';
import { PasswordHasher } from './infrastructure/auth/password-hasher';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { OpenBalance } from './infrastructure/open-balance';
import { RedisGrantedDay } from './infrastructure/redis-granted-day';

import { RegisterUserHandler } from './application/commands/register-user/register-user.handler';
import { LoginHandler } from './application/commands/login/login.handler';
import { GetUserHandler } from './application/queries/get-user/get-user.handler';
import { GetUserByEmailHandler } from './application/queries/get-user-by-email/get-user-by-email.handler';

import { AuthController } from './presentation/http/auth.controller';

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([AccountOrmEntity]),
    ConfigModule,
    LedgerModule,
    SharedRedisModule,
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserHandler,
    LoginHandler,
    GetUserHandler,
    GetUserByEmailHandler,
    PasswordHasher,
    JwtStrategy,
    OpenBalance,
    TypeOrmUserRepository,
    { provide: ACCOUNT_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: CLOCK, useClass: SystemClock },
    { provide: GRANTED_DAY, useClass: RedisGrantedDay },
  ],
  exports: [CqrsModule, JwtModule, PassportModule],
})
export class IdentityModule {}
