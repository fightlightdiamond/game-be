import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfigAsync } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig } from '@nestjs/apollo';
import GraphqlConfig from './config/graphql.config';
import { UserResolver } from './app/user/user.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // Mysql
    TypeOrmModule.forRootAsync(typeormConfigAsync),
    //Graph QL
    GraphQLModule.forRoot<ApolloDriverConfig>(GraphqlConfig.getConfig()),
  ],
  controllers: [AppController],
  providers: [AppService, UserResolver],
})
export class AppModule {}
