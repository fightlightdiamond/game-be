import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CombatModule } from '../combat/combat.module';
import { HeroCatalogModule } from '../hero-catalog/hero-catalog.module';
import { IdentityModule } from '../identity/identity.module';
import { LedgerModule } from '../ledger/ledger.module';

import { UserHeroOrmEntity } from './infrastructure/persistence/typeorm/user-hero.orm-entity';
import { EloMatchOrmEntity } from './infrastructure/persistence/typeorm/elo-match.orm-entity';
import { UserGemOrmEntity } from './infrastructure/persistence/typeorm/user-gem.orm-entity';

import { TypeOrmUserHeroRepository } from './infrastructure/persistence/typeorm/user-hero.repository';
import { TypeOrmEloMatchRepository } from './infrastructure/persistence/typeorm/elo-match.repository';
import { USER_HERO_REPOSITORY } from './domain/repositories/user-hero.repository.interface';
import { ELO_MATCH_REPOSITORY } from './domain/repositories/elo-match.repository.interface';

import { ChallengeHandler } from './application/commands/challenge/challenge.handler';
import { LevelUpUserHeroHandler } from './application/commands/level-up-user-hero/level-up-user-hero.handler';
import { AllocatePointsHandler } from './application/commands/allocate-points/allocate-points.handler';

import { GetLeaderboardHandler } from './application/queries/get-leaderboard/get-leaderboard.handler';
import { GetUserHeroHandler } from './application/queries/get-user-hero/get-user-hero.handler';
import { GetEloMatchHistoryHandler } from './application/queries/get-elo-match-history/get-elo-match-history.handler';

import { UserHeroController } from './presentation/http/user-hero.controller';
import { EloMatchController } from './presentation/http/elo-match.controller';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      UserHeroOrmEntity,
      EloMatchOrmEntity,
      UserGemOrmEntity,
    ]),
    CombatModule,
    HeroCatalogModule,
    IdentityModule,
    LedgerModule,
  ],
  controllers: [UserHeroController, EloMatchController],
  providers: [
    // Command handlers
    ChallengeHandler,
    LevelUpUserHeroHandler,
    AllocatePointsHandler,
    // Query handlers
    GetLeaderboardHandler,
    GetUserHeroHandler,
    GetEloMatchHistoryHandler,
    // Infrastructure repositories
    TypeOrmUserHeroRepository,
    TypeOrmEloMatchRepository,
    { provide: USER_HERO_REPOSITORY, useClass: TypeOrmUserHeroRepository },
    { provide: ELO_MATCH_REPOSITORY, useClass: TypeOrmEloMatchRepository },
  ],
  exports: [CqrsModule],
})
export class RankingModule {}
