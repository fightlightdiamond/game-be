import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CombatModule } from '../combat/combat.module';
import { HeroCatalogModule } from '../hero-catalog/hero-catalog.module';
import { IdentityModule } from '../identity/identity.module';
import { LedgerModule } from '../ledger/ledger.module';

import { OwnedHeroOrmEntity } from './infrastructure/persistence/typeorm/owned-hero.orm-entity';
import { EloMatchOrmEntity } from './infrastructure/persistence/typeorm/elo-match.orm-entity';
import { GemOrmEntity } from './infrastructure/persistence/typeorm/gem.orm-entity';

import { TypeOrmUserHeroRepository } from './infrastructure/persistence/typeorm/user-hero.repository';
import { TypeOrmEloMatchRepository } from './infrastructure/persistence/typeorm/elo-match.repository';
import { TypeOrmGemRepository } from './infrastructure/persistence/typeorm/gem.repository';
import { USER_HERO_REPOSITORY } from './domain/repositories/user-hero.repository.interface';
import { ELO_MATCH_REPOSITORY } from './domain/repositories/elo-match.repository.interface';
import { GEM_REPOSITORY } from './domain/repositories/gem.repository';
import { ROLL } from './domain/roll';
import { MathRoll } from './infrastructure/math-roll';

import { ChallengeHandler } from './application/commands/challenge/challenge.handler';
import { LevelUpUserHeroHandler } from './application/commands/level-up-user-hero/level-up-user-hero.handler';
import { AllocatePointsHandler } from './application/commands/allocate-points/allocate-points.handler';
import { ClaimOwnedHeroHandler } from './application/commands/claim-owned-hero/claim-owned-hero.handler';
import { LevelUpGemHandler } from './application/commands/level-up-gem/level-up-gem.handler';
import { DropGemHandler } from './application/events/drop-gem.handler';

import { GetLeaderboardHandler } from './application/queries/get-leaderboard/get-leaderboard.handler';
import { GetUserHeroHandler } from './application/queries/get-user-hero/get-user-hero.handler';
import { GetEloMatchHistoryHandler } from './application/queries/get-elo-match-history/get-elo-match-history.handler';

import { UserHeroController } from './presentation/http/user-hero.controller';
import { EloMatchController } from './presentation/http/elo-match.controller';
import { GemController } from './presentation/http/gem.controller';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      OwnedHeroOrmEntity,
      EloMatchOrmEntity,
      GemOrmEntity,
    ]),
    CombatModule,
    HeroCatalogModule,
    IdentityModule,
    LedgerModule,
  ],
  controllers: [UserHeroController, EloMatchController, GemController],
  providers: [
    ChallengeHandler,
    LevelUpUserHeroHandler,
    AllocatePointsHandler,
    ClaimOwnedHeroHandler,
    LevelUpGemHandler,
    DropGemHandler,
    // Query handlers
    GetLeaderboardHandler,
    GetUserHeroHandler,
    GetEloMatchHistoryHandler,
    // Infrastructure repositories
    TypeOrmUserHeroRepository,
    TypeOrmEloMatchRepository,
    TypeOrmGemRepository,
    { provide: USER_HERO_REPOSITORY, useClass: TypeOrmUserHeroRepository },
    { provide: ELO_MATCH_REPOSITORY, useClass: TypeOrmEloMatchRepository },
    { provide: GEM_REPOSITORY, useClass: TypeOrmGemRepository },
    { provide: ROLL, useClass: MathRoll },
  ],
  exports: [CqrsModule],
})
export class RankingModule {}
