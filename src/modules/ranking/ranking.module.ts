import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CombatModule } from '../combat/combat.module';
import { HeroCatalogModule } from '../hero-catalog/hero-catalog.module';
import { IdentityModule } from '../identity/identity.module';
import { LedgerModule } from '../ledger/ledger.module';

import { OwnedHeroOrmEntity } from './infrastructure/persistence/typeorm/owned-hero.orm-entity';
import { ChallengeOrmEntity } from './infrastructure/persistence/typeorm/challenge.orm-entity';
import { GemOrmEntity } from './infrastructure/persistence/typeorm/gem.orm-entity';

import { TypeOrmOwnedHeroRepository } from './infrastructure/persistence/typeorm/owned-hero.repository';
import { TypeOrmChallengeRepository } from './infrastructure/persistence/typeorm/challenge.repository';
import { TypeOrmGemRepository } from './infrastructure/persistence/typeorm/gem.repository';
import { OWNED_HERO_REPOSITORY } from './domain/repositories/owned-hero.repository';
import { CHALLENGE_REPOSITORY } from './domain/repositories/challenge.repository';
import { GEM_REPOSITORY } from './domain/repositories/gem.repository';
import { ROLL } from './domain/roll';
import { MathRoll } from './infrastructure/math-roll';

import { ChallengeHandler } from './application/commands/challenge/challenge.handler';
import { LevelUpOwnedHeroHandler } from './application/commands/level-up-owned-hero/level-up-owned-hero.handler';
import { AllocatePointsHandler } from './application/commands/allocate-points/allocate-points.handler';
import { ClaimOwnedHeroHandler } from './application/commands/claim-owned-hero/claim-owned-hero.handler';
import { LevelUpGemHandler } from './application/commands/level-up-gem/level-up-gem.handler';
import { DropGemHandler } from './application/events/drop-gem.handler';

import { GetLeaderboardHandler } from './application/queries/get-leaderboard/get-leaderboard.handler';
import { GetOwnedHeroHandler } from './application/queries/get-owned-hero/get-owned-hero.handler';
import { GetChallengeHistoryHandler } from './application/queries/get-challenge-history/get-challenge-history.handler';

import { OwnedHeroController } from './presentation/http/owned-hero.controller';
import { ChallengeController } from './presentation/http/challenge.controller';
import { GemController } from './presentation/http/gem.controller';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      OwnedHeroOrmEntity,
      ChallengeOrmEntity,
      GemOrmEntity,
    ]),
    CombatModule,
    HeroCatalogModule,
    IdentityModule,
    LedgerModule,
  ],
  controllers: [OwnedHeroController, ChallengeController, GemController],
  providers: [
    ChallengeHandler,
    LevelUpOwnedHeroHandler,
    AllocatePointsHandler,
    ClaimOwnedHeroHandler,
    LevelUpGemHandler,
    DropGemHandler,
    // Query handlers
    GetLeaderboardHandler,
    GetOwnedHeroHandler,
    GetChallengeHistoryHandler,
    // Infrastructure repositories
    TypeOrmOwnedHeroRepository,
    TypeOrmChallengeRepository,
    TypeOrmGemRepository,
    { provide: OWNED_HERO_REPOSITORY, useClass: TypeOrmOwnedHeroRepository },
    { provide: CHALLENGE_REPOSITORY, useClass: TypeOrmChallengeRepository },
    { provide: GEM_REPOSITORY, useClass: TypeOrmGemRepository },
    { provide: ROLL, useClass: MathRoll },
  ],
  exports: [CqrsModule],
})
export class RankingModule {}
