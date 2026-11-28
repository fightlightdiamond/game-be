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

import { GetCurrentMatchHandler } from './application/queries/get-current-match/get-current-match.handler';
import { GetMatchHistoryHandler } from './application/queries/get-match-history/get-match-history.handler';
import { GetBetByUserAndMatchHandler } from './application/queries/get-bet-by-user-and-match/get-bet-by-user-and-match.handler';
import { GetMatchStatisticsHandler } from './application/queries/get-match-statistics/get-match-statistics.handler';

import { HouseMatchScheduler } from './infrastructure/jobs/house-match.scheduler';
import { BetConsumer } from './infrastructure/jobs/bet.consumer';

import { BetController } from './presentation/http/bet.controller';
import { MatchController } from './presentation/http/match.controller';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([HouseMatchOrmEntity, StakeOrmEntity]),
    BullModule.registerQueue({ name: 'bet' }),
    CombatModule,
    IdentityModule,
    HeroCatalogModule,
  ],
  controllers: [BetController, MatchController],
  providers: [
    OpenHouseMatchHandler,
    PlaceStakeHandler,
    RevealHouseMatchHandler,
    SettleHouseMatchHandler,
    GetCurrentMatchHandler,
    GetMatchHistoryHandler,
    GetBetByUserAndMatchHandler,
    GetMatchStatisticsHandler,
    TypeOrmHouseMatchRepository,
    TypeOrmStakeRepository,
    HouseMatchScheduler,
    BetConsumer,
    {
      provide: HOUSE_MATCH_REPOSITORY,
      useClass: TypeOrmHouseMatchRepository,
    },
    { provide: STAKE_REPOSITORY, useClass: TypeOrmStakeRepository },
  ],
  exports: [CqrsModule],
})
export class BettingModule {}
