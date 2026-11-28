import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { CombatModule } from '../combat/combat.module';
import { IdentityModule } from '../identity/identity.module';
import { HeroCatalogModule } from '../hero-catalog/hero-catalog.module';

import { HouseMatchOrmEntity } from './infrastructure/persistence/typeorm/house-match.orm-entity';
import { StakeOrmEntity } from './infrastructure/persistence/typeorm/stake.orm-entity';
import { TypeOrmHouseMatchRepository } from './infrastructure/persistence/typeorm/house-match.repository';
import { TypeOrmStakeRepository } from './infrastructure/persistence/typeorm/stake.repository';

import { HOUSE_MATCH_REPOSITORY } from './domain/repositories/house-match.repository';
import { STAKE_REPOSITORY } from './domain/repositories/stake.repository';

import { OpenHouseMatchHandler } from './application/commands/open-house-match/open-house-match.handler';
import { PlaceStakeHandler } from './application/commands/place-stake/place-stake.handler';
import { RevealHouseMatchHandler } from './application/commands/reveal-house-match/reveal-house-match.handler';
import { SettleHouseMatchHandler } from './application/commands/settle-house-match/settle-house-match.handler';

import { GetCurrentHouseMatchHandler } from './application/queries/get-current-house-match/get-current-house-match.handler';
import { GetHouseMatchHistoryHandler } from './application/queries/get-house-match-history/get-house-match-history.handler';
import { GetStakeHandler } from './application/queries/get-stake/get-stake.handler';
import { GetHouseMatchStatisticsHandler } from './application/queries/get-house-match-statistics/get-house-match-statistics.handler';

import { HouseMatchScheduler } from './infrastructure/jobs/house-match.scheduler';
import { StakeConsumer } from './infrastructure/jobs/stake.consumer';

import { StakeController } from './presentation/http/stake.controller';
import { HouseMatchController } from './presentation/http/house-match.controller';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([HouseMatchOrmEntity, StakeOrmEntity]),
    BullModule.registerQueue({ name: 'bet' }),
    CombatModule,
    IdentityModule,
    HeroCatalogModule,
  ],
  controllers: [StakeController, HouseMatchController],
  providers: [
    OpenHouseMatchHandler,
    PlaceStakeHandler,
    RevealHouseMatchHandler,
    SettleHouseMatchHandler,
    GetCurrentHouseMatchHandler,
    GetHouseMatchHistoryHandler,
    GetStakeHandler,
    GetHouseMatchStatisticsHandler,
    TypeOrmHouseMatchRepository,
    TypeOrmStakeRepository,
    HouseMatchScheduler,
    StakeConsumer,
    {
      provide: HOUSE_MATCH_REPOSITORY,
      useClass: TypeOrmHouseMatchRepository,
    },
    { provide: STAKE_REPOSITORY, useClass: TypeOrmStakeRepository },
  ],
  exports: [CqrsModule],
})
export class HouseBettingModule {}
