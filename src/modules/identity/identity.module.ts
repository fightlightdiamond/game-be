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
import { TypeOrmAccountRepository } from './infrastructure/persistence/typeorm/account.repository';
import { PasswordHasher } from './infrastructure/auth/password-hasher';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { OpenBalance } from './infrastructure/open-balance';
import { RedisGrantedDay } from './infrastructure/redis-granted-day';

import { RegisterAccountHandler } from './application/commands/register-account/register-account.handler';
import { LoginHandler } from './application/commands/login/login.handler';
import { GetAccountHandler } from './application/queries/get-account/get-account.handler';
import { GetAccountByEmailHandler } from './application/queries/get-account-by-email/get-account-by-email.handler';

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
    RegisterAccountHandler,
    LoginHandler,
    GetAccountHandler,
    GetAccountByEmailHandler,
    PasswordHasher,
    JwtStrategy,
    OpenBalance,
    TypeOrmAccountRepository,
    { provide: ACCOUNT_REPOSITORY, useClass: TypeOrmAccountRepository },
    { provide: CLOCK, useClass: SystemClock },
    { provide: GRANTED_DAY, useClass: RedisGrantedDay },
  ],
  exports: [CqrsModule, JwtModule, PassportModule],
})
export class IdentityModule {}
