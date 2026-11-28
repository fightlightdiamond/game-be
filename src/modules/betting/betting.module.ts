import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { CombatModule } from '../combat/combat.module';
import { IdentityModule } from '../identity/identity.module';
import { HeroCatalogModule } from '../hero-catalog/hero-catalog.module';
import { LedgerModule } from '../ledger/ledger.module';

import { BettingMatchOrmEntity } from './infrastructure/persistence/typeorm/betting-match.orm-entity';
import { BetOrmEntity } from './infrastructure/persistence/typeorm/bet.orm-entity';
import { TypeOrmBettingMatchRepository } from './infrastructure/persistence/typeorm/betting-match.repository';
import { TypeOrmBetRepository } from './infrastructure/persistence/typeorm/bet.repository';

import { BETTING_MATCH_REPOSITORY } from './domain/repositories/betting-match.repository.interface';
import { BET_REPOSITORY } from './domain/repositories/bet.repository.interface';

import { StartMatchHandler } from './application/commands/start-match/start-match.handler';
import { PlaceBetHandler } from './application/commands/place-bet/place-bet.handler';
import { ResolveFightingHandler } from './application/commands/resolve-fighting/resolve-fighting.handler';
import { ResolveRewardHandler } from './application/commands/resolve-reward/resolve-reward.handler';

import { GetCurrentMatchHandler } from './application/queries/get-current-match/get-current-match.handler';
import { GetMatchHistoryHandler } from './application/queries/get-match-history/get-match-history.handler';
import { GetBetByUserAndMatchHandler } from './application/queries/get-bet-by-user-and-match/get-bet-by-user-and-match.handler';
import { GetMatchStatisticsHandler } from './application/queries/get-match-statistics/get-match-statistics.handler';

import { PreMatchCron } from './infrastructure/jobs/pre-match.cron';
import { BetConsumer } from './infrastructure/jobs/bet.consumer';

import { BetController } from './presentation/http/bet.controller';
import { MatchController } from './presentation/http/match.controller';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([BettingMatchOrmEntity, BetOrmEntity]),
    BullModule.registerQueue({ name: 'bet' }),
    CombatModule,
    IdentityModule,
    HeroCatalogModule,
    LedgerModule,
  ],
  controllers: [BetController, MatchController],
  providers: [
    // Command handlers
    StartMatchHandler,
    PlaceBetHandler,
    ResolveFightingHandler,
    ResolveRewardHandler,
    // Query handlers
    GetCurrentMatchHandler,
    GetMatchHistoryHandler,
    GetBetByUserAndMatchHandler,
    GetMatchStatisticsHandler,
    // Infrastructure
    TypeOrmBettingMatchRepository,
    TypeOrmBetRepository,
    PreMatchCron,
    BetConsumer,
    {
      provide: BETTING_MATCH_REPOSITORY,
      useClass: TypeOrmBettingMatchRepository,
    },
    { provide: BET_REPOSITORY, useClass: TypeOrmBetRepository },
  ],
  exports: [CqrsModule],
})
export class BettingModule {}
