import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { UserOrmEntity } from './infrastructure/persistence/typeorm/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm/user.repository';
import { PasswordHasher } from './domain/services/password-hasher.service';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

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
    TypeOrmModule.forFeature([UserOrmEntity]),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserHandler,
    LoginHandler,
    GetUserHandler,
    GetUserByEmailHandler,
    PasswordHasher,
    JwtStrategy,
    TypeOrmUserRepository,
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [CqrsModule, JwtModule, PassportModule],
})
export class IdentityModule {}
