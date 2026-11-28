# Implementation Plan: DDD Refactor of game-be

## Overview

Restructure the `game-be` NestJS monolith into a Domain-Driven Design architecture with four Bounded Contexts (Identity, HeroCatalog, Betting, Ranking) and one Shared Kernel (Combat). Each context gets explicit `domain/`, `application/`, `infrastructure/`, and `presentation/` layers. CQRS via `@nestjs/cqrs` replaces direct service calls. No database schema changes are made.

Ordering constraint: **Combat → HeroCatalog & Identity (parallel) → Betting → Ranking → AppModule wiring → Cleanup**. Within each phase, independent sub-tasks are listed so they can run in parallel.

---

## Tasks

- [x] 1. Project setup: install dependencies and scaffold folder structure

  - [x] 1.1 Install `@nestjs/cqrs` and `fast-check` dev dependency

    - Run `npm install @nestjs/cqrs` and `npm install --save-dev fast-check`
    - Verify `@nestjs/cqrs` appears in `dependencies` and `fast-check` in `devDependencies` of `package.json`
    - _Requirements: 2.1_

  - [x] 1.2 Scaffold `src/modules/` directory tree

    - Create the following empty index files to establish module boundaries: `src/modules/combat/combat.module.ts`, `src/modules/identity/identity.module.ts`, `src/modules/hero-catalog/hero-catalog.module.ts`, `src/modules/betting/betting.module.ts`, `src/modules/ranking/ranking.module.ts`
    - Each file should export a bare `@Module({})` stub class so the project compiles
    - _Requirements: 1.1, 11.1_

  - [x] 1.3 Create `src/shared/` structure and migrate shared constants
    - Create `src/shared/constants/bet-status.constant.ts` — copy content from existing `src/app/bet/bet-status.constant.ts` (or equivalent location)
    - Create `src/shared/constants/name-queue.constant.ts` — define the `'socket.io'` and `'bet'` queue name constants
    - Create `src/shared/constants/gem-drop.constant.ts` — copy the gem drop chance constant from `RewardService`
    - Create `src/shared/pipes/validation.pipe.ts` — move the global `ValidationPipe` configuration here
    - _Requirements: 1.1_

- [x] 2. Combat Shared Kernel

  - [x] 2.1 Create Combat domain value objects: `HeroSnapshot`, `TurnLog`, `CombatResult`

    - `src/modules/combat/domain/value-objects/hero-snapshot.vo.ts`: immutable class with all 15 stat fields as `readonly`; implement `withHp(hp)`, `withAtk(atk)`, `withDef(def)`, `withSpd(spd)`, and other builder methods that return new `HeroSnapshot` instances
    - `src/modules/combat/domain/value-objects/turn-log.vo.ts`: immutable class with fields `turnNumber`, `attackerId`, `defenderId`, `damage`, `skillDamage`, `attackerHpAfter`, `defenderHpAfter`, `isCrit`, `isActiveSkill`
    - `src/modules/combat/domain/value-objects/combat-result.vo.ts`: immutable class with `winnerId`, `loserId`, `turns: TurnLog[]`, `turnNumber`
    - No NestJS decorators anywhere in this file — pure TypeScript
    - _Requirements: 6.3, 6.4, 6.8_

  - [x] 2.2 Create `UnknownHeroSkillException` domain exception

    - `src/modules/combat/domain/exceptions/unknown-hero-skill.exception.ts`: plain class extending `Error`; constructor accepts `heroName: string`; message: `Unknown hero skill: ${heroName}`
    - _Requirements: 6.7_

  - [x] 2.3 Create `SkillStrategy` interface and all 11 hero skill implementations

    - `src/modules/combat/domain/skills/skill.strategy.interface.ts`: define `interface SkillStrategy { apply(attacker: HeroSnapshot, defender: HeroSnapshot): [HeroSnapshot, HeroSnapshot]; }`
    - Create one file per hero under `src/modules/combat/domain/skills/`: `hell.skill.ts`, `sphinx.skill.ts`, `darklord.skill.ts`, `valkyrie.skill.ts`, `poseidon.skill.ts`, `phoenix.skill.ts`, `chiron.skill.ts`, `hera.skill.ts`, `fenrir.skill.ts`, `amon.skill.ts`, `nezha.skill.ts`
    - Port skill logic directly from the existing `SkillService` static methods in `src/app/round/skill.service.ts` (or equivalent); each implementation is a plain class with no NestJS decorators; `apply` returns two new `HeroSnapshot` instances
    - _Requirements: 6.5, 6.6, 6.8_

  - [x] 2.4 Create `SkillRegistry` service

    - `src/modules/combat/services/skill-registry.service.ts`: `@Injectable()` class; constructor builds a `Map<string, SkillStrategy>` with all 11 entries keyed by hero name (exact match to hero name strings in the DB: `'Hell'`, `'Sphinx'`, etc.)
    - Implement `get(heroName: string): SkillStrategy` — throws `UnknownHeroSkillException` if name not found
    - _Requirements: 6.5, 6.7_

  - [x] 2.5 Create stateless `CombatEngine` service

    - `src/modules/combat/services/combat-engine.service.ts`: `@Injectable()` class; inject `SkillRegistry`
    - Implement `simulate(home: HeroSnapshot, away: HeroSnapshot): CombatResult` — all state is local to the method; loop runs at most 20 turns; each round the faster hero (by `spd`) attacks first; both `home` and `away` are **never mutated** — use `HeroSnapshot` builder methods for working copies; determine winner by remaining HP at loop exit
    - Implement private `executeTurn(attacker, defender, turnNumber, turns)` helper that calls `skillRegistry.get(attacker.name).apply(attacker, defender)`, records a `TurnLog`, and returns `[newAttacker, newDefender]`
    - _Requirements: 6.1, 6.2, 6.3, 6.10, 12.1, 12.2, 12.3_

  - [x] 2.6 Create `CombatModule`

    - `src/modules/combat/combat.module.ts`: `@Module({ providers: [SkillRegistry, CombatEngine], exports: [CombatEngine] })`
    - _Requirements: 6.9, 11.1_

  - [ ]\* 2.7 Write property-based tests for `CombatEngine` (Properties 1–3)
    - File: `src/modules/combat/services/combat-engine.service.spec.ts`
    - Create `heroSnapshotArb` fast-check arbitrary: `hp > 0`, `atk > 0`, `def ≥ 0`, `spd ∈ [1, 100]`, all other stats ∈ `[0, 1]` as fractions; name drawn from the 11 registered hero names
    - **Property 1: CombatEngine Termination** — `fc.property(heroSnapshotArb, heroSnapshotArb, (home, away) => { const r = engine.simulate(home, away); expect(r.turnNumber).toBeGreaterThanOrEqual(1); expect(r.turnNumber).toBeLessThanOrEqual(20); })` with `numRuns: 100` — **Validates: Requirements 6.2, 6.10, 13.1**
    - **Property 2: CombatEngine Input Immutability** — after `simulate(home, away)`, assert all fields on both snapshots are identical to before — **Validates: Requirements 6.3, 12.1**
    - **Property 3: CombatEngine Simulation Symmetry** — for distinct `spd` values, `simulate(A, B).winnerId === simulate(B, A).winnerId` — **Validates: Requirements 12.4**
    - _Requirements: 13.1, 13.6_

- [x] 3. HeroCatalog Bounded Context

  - [x] 3.1 Create Hero domain layer

    - `src/modules/hero-catalog/domain/value-objects/hero-stats.vo.ts`: immutable class with all 13 numeric stat fields as `readonly`
    - `src/modules/hero-catalog/domain/aggregates/hero.aggregate.ts`: plain class (no `AggregateRoot`) with `id`, `name`, `element`, `position`, `story`, `guide`, `skill`, and `stats: HeroStats` as `readonly` constructor fields
    - `src/modules/hero-catalog/domain/repositories/hero.repository.interface.ts`: export `HERO_REPOSITORY = Symbol('IHeroRepository')` and `interface IHeroRepository { findById, findByName, getPair, listAll }`
    - _Requirements: 5.1, 5.2, 5.3, 9.1_

  - [x] 3.2 Create HeroCatalog ORM entity and TypeORM repository

    - `src/modules/hero-catalog/infrastructure/persistence/typeorm/hero.orm-entity.ts`: `@Entity('heroes')` class mapping all columns from the existing `heroes` table (no schema changes)
    - `src/modules/hero-catalog/infrastructure/persistence/typeorm/hero.repository.ts`: `@Injectable()` class implementing `IHeroRepository`; inject `Repository<HeroOrmEntity>` via `@InjectRepository`; implement `toDomain(row): Hero` and `toOrm(hero): HeroOrmEntity` private mappers; port the existing random-pair selection logic from `HeroRepository.getPairHeroes()` for `getPair()`
    - _Requirements: 5.4, 5.5, 9.2, 9.3, 9.4, 15.1_

  - [x] 3.3 Create HeroCatalog query handlers

    - `src/modules/hero-catalog/application/queries/get-hero/get-hero.query.ts` + `get-hero.handler.ts`: query accepts `heroId: number`; handler injects `IHeroRepository` and returns the `Hero` aggregate or null
    - `src/modules/hero-catalog/application/queries/get-hero-pair/get-hero-pair.query.ts` + `get-hero-pair.handler.ts`: no input; handler calls `heroRepo.getPair()` and returns `[Hero, Hero]`
    - `src/modules/hero-catalog/application/queries/list-heroes/list-heroes.query.ts` + `list-heroes.handler.ts`: no input; returns `Hero[]` from `heroRepo.listAll()`
    - _Requirements: 5.3, 5.4, 2.3, 2.4, 2.7_

  - [x] 3.4 Create HeroCatalog presentation layer

    - `src/modules/hero-catalog/presentation/http/hero.controller.ts`: `@Controller('heroes')`; `GET /heroes` calls `ListHeroesQuery`; `GET /heroes/:id` calls `GetHeroQuery`; inject `QueryBus`
    - _Requirements: 5.6, 2.3_

  - [x] 3.5 Create `HeroCatalogModule`
    - `src/modules/hero-catalog/hero-catalog.module.ts`: import `CqrsModule`, `TypeOrmModule.forFeature([HeroOrmEntity])`; register query handlers in `providers`; bind `HERO_REPOSITORY` token to `TypeOrmHeroRepository` via `useClass`; export `CqrsModule`
    - _Requirements: 1.6, 11.1_

- [x] 4. Identity Bounded Context

  - [x] 4.1 Create Identity domain value objects and exceptions

    - `src/modules/identity/domain/value-objects/wallet.vo.ts`: immutable; constructor takes `balance: number`; `deduct(amount): Wallet` — throws `InsufficientFundsException` if `amount > balance`, else returns `new Wallet(balance - amount)`; `credit(amount): Wallet` — returns `new Wallet(balance + amount)`; `getBalance(): number`
    - `src/modules/identity/domain/value-objects/email.vo.ts`: immutable; wraps a validated email string
    - `src/modules/identity/domain/exceptions/insufficient-funds.exception.ts`: plain class extending `Error`; message `Insufficient funds: required ${amount}, available ${balance}`
    - _Requirements: 4.2, 4.3, 9.1_

  - [x] 4.2 Create `User` aggregate

    - `src/modules/identity/domain/aggregates/user.aggregate.ts`: extends `AggregateRoot` from `@nestjs/cqrs`; constructor fields: `id`, `email`, `passwordHash` (private), `role: RoleEnum`, `confirmedEmail: boolean`, `wallet: Wallet` (private)
    - Implement `static create(id, email, passwordHash): User`
    - Implement `deductBalance(amount): void` — calls `this.wallet = this.wallet.deduct(amount)` and applies a domain event
    - Implement `creditBalance(amount): void` — calls `this.wallet = this.wallet.credit(amount)`
    - Implement `getBalance(): number` — delegates to `this.wallet.getBalance()`
    - _Requirements: 4.1, 4.2_

  - [x] 4.3 Create Identity repository interface

    - `src/modules/identity/domain/repositories/user.repository.interface.ts`: export `USER_REPOSITORY = Symbol('IUserRepository')` and `interface IUserRepository { findById(id: number): Promise<User | null>; findByEmail(email: string): Promise<User | null>; save(user: User): Promise<User>; }`
    - _Requirements: 4.6, 9.1_

  - [x] 4.4 Create Identity domain service: `PasswordHasher`

    - `src/modules/identity/domain/services/password-hasher.service.ts`: `@Injectable()`; wraps `bcrypt.hash` and `bcrypt.compare`; interface so it can be mocked in unit tests
    - _Requirements: 4.7_

  - [x] 4.5 Create `UserOrmEntity` and `TypeOrmUserRepository`

    - `src/modules/identity/infrastructure/persistence/typeorm/user.orm-entity.ts`: `@Entity('users')` matching existing column layout (no schema change)
    - `src/modules/identity/infrastructure/persistence/typeorm/user.repository.ts`: implements `IUserRepository`; `toDomain` maps `UserOrmEntity` → `User` aggregate (constructing a `Wallet` from `row.balance`); `toOrm` maps back; inject `Repository<UserOrmEntity>`
    - _Requirements: 4.9, 9.2, 9.3, 9.4, 15.1_

  - [x] 4.6 Create Identity command handlers

    - `register-user.command.ts` + `register-user.handler.ts`: hash password via `PasswordHasher`, construct `User.create(...)`, persist via `IUserRepository`
    - `login.command.ts` + `login.handler.ts`: load user by email, verify password hash, sign and return JWT; no session state stored
    - `deduct-balance.command.ts` + `deduct-balance.handler.ts`: load `User`, call `user.deductBalance(amount)`, save, return new balance
    - `credit-balance.command.ts` + `credit-balance.handler.ts`: load `User`, call `user.creditBalance(amount)`, save, return new balance
    - All handlers in `src/modules/identity/application/commands/<command-name>/`
    - _Requirements: 4.4, 4.5, 4.7, 4.8, 2.6_

  - [x] 4.7 Create Identity query handlers

    - `get-user.query.ts` + `get-user.handler.ts`: accepts `userId: number`; returns `User | null`
    - `get-user-by-email.query.ts` + `get-user-by-email.handler.ts`: accepts `email: string`; returns `User | null`
    - All handlers in `src/modules/identity/application/queries/<query-name>/`
    - _Requirements: 2.7_

  - [x] 4.8 Migrate JWT infrastructure into Identity BC

    - `src/modules/identity/infrastructure/auth/jwt.strategy.ts`: copy from existing `src/app/auth/guards/jwt.strategy.guard.ts`; update import paths
    - `src/modules/identity/infrastructure/auth/jwt.guard.ts`: copy from existing `src/app/auth/guards/jwt.guard.ts`
    - `src/modules/identity/infrastructure/auth/roles.guard.ts`: copy from existing `src/app/auth/guards/roles.guard.ts`
    - _Requirements: 1.3_

  - [x] 4.9 Create Identity presentation layer

    - `src/modules/identity/presentation/http/auth.controller.ts`: `POST /auth/login` → `LoginCommand`; `POST /auth/register` → `RegisterUserCommand`; inject `CommandBus`
    - `src/modules/identity/presentation/graphql/auth.resolver.ts`: GraphQL mutations for `login` and `signup` matching existing `schema.gql` type names; dispatch via `CommandBus`
    - _Requirements: 1.5, 2.2, 14.1, 14.2, 14.3_

  - [x] 4.10 Create `IdentityModule`

    - `src/modules/identity/identity.module.ts`: import `CqrsModule`, `JwtModule`, `PassportModule`, `TypeOrmModule.forFeature([UserOrmEntity])`; register all command + query handlers in `providers`; bind `USER_REPOSITORY` token; export `CqrsModule` so cross-context CommandBus calls to `DeductBalanceCommand` and `CreditBalanceCommand` are routable
    - _Requirements: 1.6, 11.1_

  - [ ]\* 4.11 Write property-based tests for `Wallet` (Properties 5–7)
    - File: `src/modules/identity/domain/value-objects/wallet.vo.spec.ts`
    - Create `walletArb`: `fc.integer({ min: 0, max: 1_000_000 })`
    - **Property 5: Wallet Immutability** — after `w.deduct(amount)` or `w.credit(amount)`, original `w.getBalance()` unchanged — **Validates: Requirements 4.2**
    - **Property 6: Wallet Insufficient Funds Guard** — for `amount > balance`, `deduct` throws `InsufficientFundsException` and balance unchanged — **Validates: Requirements 4.3**
    - **Property 7: Wallet Balance Conservation** — sequences of ≥ 10 `credit`/`deduct` ops where no `deduct` exceeds balance; final balance equals `initial + Σcredits − Σdeducts` — **Validates: Requirements 13.3, 13.7**
    - _Requirements: 13.3, 13.7_

- [x] 5. Betting BC — Domain Layer

  - [x] 5.1 Create Betting domain value objects and exceptions

    - `src/modules/betting/domain/value-objects/bet-amount.vo.ts`: immutable; wraps a positive number; throws `Error` if `amount <= 0` in constructor
    - `src/modules/betting/domain/value-objects/match-status.vo.ts`: enum or typed constant `PENDING=0`, `BETTING=1`, `FIGHTING=2`, `END=3` aligned with `BetStatusConstant`
    - `src/modules/betting/domain/exceptions/invalid-match-transition.exception.ts`: extends `Error`; message includes current and attempted status
    - `src/modules/betting/domain/exceptions/betting-closed.exception.ts`: extends `Error`
    - _Requirements: 7.1, 7.3_

  - [x] 5.2 Create Betting domain events

    - `src/modules/betting/domain/events/match-created.event.ts`: `class MatchCreatedEvent { constructor(public readonly matchId: number, public readonly heroInfo: HeroSnapshot[], public readonly startTime: string) {} }`
    - `src/modules/betting/domain/events/fighting-started.event.ts`: `class FightingStartedEvent { constructor(public readonly matchId: number) {} }`
    - `src/modules/betting/domain/events/match-ended.event.ts`: `class MatchEndedEvent { constructor(public readonly matchId: number, public readonly winnerBets: { userId: number; payout: number }[]) {} }`
    - `src/modules/betting/domain/events/bet-placed.event.ts`: `class BetPlacedEvent { constructor(public readonly matchId: number, public readonly userId: number, public readonly heroId: number, public readonly amount: number) {} }`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 5.3 Create `Bet` entity and `BettingMatch` aggregate

    - `src/modules/betting/domain/entities/bet.entity.ts`: plain class with `id`, `userId`, `matchId`, `heroId`, `balance`, `result`; no AggregateRoot (Bet is a child entity inside BettingMatch)
    - `src/modules/betting/domain/aggregates/betting-match.aggregate.ts`: extends `AggregateRoot`; fields: `status: number`, `bets: Bet[]`, `combatResult: CombatResult`, `heroInfo: HeroSnapshot[]`
    - `static create(heroInfo, combatResult): BettingMatch` — sets `status = PENDING`
    - `startBetting(): void` — asserts `status === PENDING` else throw `InvalidMatchTransitionException`; sets `status = BETTING`; calls `this.apply(new MatchCreatedEvent(...))`
    - `startFighting(): void` — asserts `status === BETTING`; sets `status = FIGHTING`; calls `this.apply(new FightingStartedEvent(...))`
    - `endMatch(policy: RewardPolicy): void` — asserts `status === FIGHTING`; computes payouts; sets `status = END`; calls `this.apply(new MatchEndedEvent(...))`
    - `placeBet(userId, heroId, amount): void` — throws `BettingClosedException` if `status !== BETTING`; throws if user already has a bet; pushes new `Bet`; calls `this.apply(new BetPlacedEvent(...))`
    - _Requirements: 7.1, 7.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 5.4 Create `RewardPolicy` domain service

    - `src/modules/betting/domain/services/reward-policy.service.ts`: plain class (no `@Injectable` — instantiated by application layer)
    - `calculatePayouts(bets: Bet[], winnerId: number): Map<number, number>` — filters bets on `winnerId`; returns `userId → bet.balance × 2`; invariant: sum of payouts ≤ sum of winning bet balances × 2
    - `shouldDropGem(): boolean` — uses `GEM_DROP_CHANCE` constant from `src/shared/constants/gem-drop.constant.ts`
    - _Requirements: 7.8, 7.9, 13.5_

  - [x] 5.5 Create Betting repository interfaces

    - `src/modules/betting/domain/repositories/betting-match.repository.interface.ts`: export `BETTING_MATCH_REPOSITORY` symbol and `IBettingMatchRepository { findById, save, findCurrentMatchId }`
    - `src/modules/betting/domain/repositories/bet.repository.interface.ts`: export `BET_REPOSITORY` symbol and `IBetRepository { findByMatchAndHero, findByMatchAndUser }`
    - _Requirements: 7.11, 7.12, 9.1_

  - [ ]\* 5.6 Write property-based tests for `BettingMatch` state machine (Property 4) and `RewardPolicy` (Property 9)
    - File: `src/modules/betting/domain/aggregates/betting-match.aggregate.spec.ts`
    - **Property 4: BettingMatch Monotonic State** — generate valid transition sequences; assert `status` never decreases; assert any transition from `END` throws `InvalidMatchTransitionException` — **Validates: Requirements 7.1, 13.2**
    - File: `src/modules/betting/domain/services/reward-policy.service.spec.ts`
    - **Property 9: RewardPolicy No-Money-Creation** — `betListArb` generates lists of `Bet` with positive balances; assert `sum(payouts.values()) <= sum(winning bets) * 2` — **Validates: Requirements 7.8, 13.5**
    - _Requirements: 13.2, 13.5_

- [x] 6. Betting BC — Application Layer

  - [x] 6.1 Create Betting command handlers (StartMatch, ResolveFighting, ResolveReward)

    - `start-match/start-match.command.ts` + `start-match.handler.ts`: inject `QueryBus`, `IBettingMatchRepository`, `CombatEngine`; dispatch `GetHeroPairQuery` → call `CombatEngine.simulate` → `BettingMatch.create(heroInfo, result)` → `match.startBetting()` → save → schedule Bull jobs (ResolveFighting at +60s, ResolveReward at +180s)
    - `resolve-fighting/resolve-fighting.command.ts` + `resolve-fighting.handler.ts`: load match by id; call `match.startFighting()`; save
    - `resolve-reward/resolve-reward.command.ts` + `resolve-reward.handler.ts`: load match; load bets via `IBetRepository.findByMatchAndHero`; instantiate `RewardPolicy`; call `match.endMatch(policy)`; for each winning bet dispatch `CreditBalanceCommand`; if `policy.shouldDropGem()` dispatch `AddGemCommand` to Ranking BC
    - _Requirements: 7.2, 7.6, 7.7, 2.6_

  - [x] 6.2 Create `PlaceBetHandler`

    - `place-bet/place-bet.command.ts` + `place-bet.handler.ts`: inject `CommandBus`, `IBettingMatchRepository`, `IBetRepository`; first dispatch `DeductBalanceCommand(userId, amount)` — if it throws `InsufficientFundsException` re-throw without persisting; call `match.placeBet(userId, heroId, amount)`; save bet via `IBetRepository`
    - _Requirements: 7.3, 7.4, 7.5, 2.6_

  - [x] 6.3 Create Betting query handlers
    - `get-current-match/`: dispatch `findCurrentMatchId()` then `findById()`; return current match DTO
    - `get-match-history/`: return paginated past matches for a user
    - `get-bet-by-user-and-match/`: call `IBetRepository.findByMatchAndUser`
    - `get-match-statistics/`: call raw statistics method on `IBettingMatchRepository`
    - All in `src/modules/betting/application/queries/<query-name>/`
    - _Requirements: 2.7_

- [x] 7. Betting BC — Infrastructure and Presentation

  - [x] 7.1 Create Betting ORM entities and TypeORM repositories

    - `src/modules/betting/infrastructure/persistence/typeorm/betting-match.orm-entity.ts`: `@Entity('matches')` matching existing schema
    - `src/modules/betting/infrastructure/persistence/typeorm/bet.orm-entity.ts`: `@Entity('bets')` matching existing schema
    - `src/modules/betting/infrastructure/persistence/typeorm/betting-match.repository.ts`: implements `IBettingMatchRepository`; `findCurrentMatchId` queries the row with `status = BETTING` or `FIGHTING`; `toDomain` reconstructs `BettingMatch` aggregate from ORM row; for the statistics query, expose the raw SQL via a typed method on the interface
    - `src/modules/betting/infrastructure/persistence/typeorm/bet.repository.ts`: implements `IBetRepository`
    - _Requirements: 9.2, 9.3, 9.4, 9.6, 15.1_

  - [x] 7.2 Create Betting infrastructure jobs

    - `src/modules/betting/infrastructure/jobs/pre-match.cron.ts`: `@Cron('0 */3 * * * *')` — dispatches `StartMatchCommand` via `CommandBus`; no domain logic in this class
    - `src/modules/betting/infrastructure/jobs/bet.consumer.ts`: `@Processor('bet')` — handles `ResolveFightingJob` and `ResolveRewardJob` by dispatching the corresponding commands
    - _Requirements: 7.6, 7.10_

  - [x] 7.3 Create Betting presentation layer

    - `src/modules/betting/presentation/http/bet.controller.ts`: `POST /bets` → `PlaceBetCommand`; `GET /bets?matchId&userId` → `GetBetByUserAndMatchQuery`
    - `src/modules/betting/presentation/http/match.controller.ts`: `GET /matches/current` → `GetCurrentMatchQuery`; `GET /matches/history` → `GetMatchHistoryQuery`; `GET /matches/statistics` → `GetMatchStatisticsQuery`
    - Inject `CommandBus` / `QueryBus`; use existing DTO shapes to preserve API surface
    - _Requirements: 1.5, 2.2, 2.3_

  - [x] 7.4 Create `BettingModule`
    - `src/modules/betting/betting.module.ts`: import `CqrsModule`, `CombatModule`, `IdentityModule` (for cross-context bus access), `HeroCatalogModule`, `TypeOrmModule.forFeature([BettingMatchOrmEntity, BetOrmEntity])`, `BullModule.registerQueue({ name: 'bet' })`; register all handlers, cron, consumer in `providers`; bind repository tokens
    - _Requirements: 1.6, 11.1_

- [x] 8. Ranking BC — Domain Layer

  - [x] 8.1 Create Ranking domain value objects and exceptions

    - `src/modules/ranking/domain/value-objects/elo-rating.vo.ts`: immutable; `static initial(): EloRating` returns `new EloRating(1600)`; `recalculate(opponentRating: EloRating, outcome: 1 | 0): EloRating` — uses `@studimax/elo` with `kFactor: 20`, returns a new `EloRating`; original unchanged; `getValue(): number`
    - `src/modules/ranking/domain/exceptions/exceeds-level-cap.exception.ts`: extends `Error`; includes `requested` and `maxAllowed` in message
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 8.2 Create Ranking domain events and `EloMatch` entity

    - `src/modules/ranking/domain/events/elo-updated.event.ts`: `class EloUpdatedEvent { constructor(public readonly userHeroId: number, public readonly newRating: number) {} }`
    - `src/modules/ranking/domain/entities/elo-match.entity.ts`: plain class with same field shape as `EloMatchOrmEntity` (no `AggregateRoot`)
    - _Requirements: 8.5_

  - [x] 8.3 Create `UserHero` aggregate

    - `src/modules/ranking/domain/aggregates/user-hero.aggregate.ts`: extends `AggregateRoot`; fields as per design; `levelUp(): void`; `allocatePoints(atk, def, hp, spd, critRate): void` — throws `ExceedsLevelCapException` if sum > `this.level`; `applyEloResult(newRating: EloRating): void` — updates `eloRating` and calls `this.apply(new EloUpdatedEvent(...))`
    - _Requirements: 8.1, 8.3_

  - [x] 8.4 Create Ranking repository interfaces

    - `src/modules/ranking/domain/repositories/user-hero.repository.interface.ts`: export `USER_HERO_REPOSITORY` symbol and `IUserHeroRepository { findById, findByUserId, save, findLeaderboard(options) }`
    - `src/modules/ranking/domain/repositories/elo-match.repository.interface.ts`: export `ELO_MATCH_REPOSITORY` symbol and `IEloMatchRepository { save, findByUserId }`
    - _Requirements: 8.7, 9.1_

  - [ ]\* 8.5 Write property-based tests for `EloRating` (Property 8) and `UserHero` level cap (Property 10)
    - File: `src/modules/ranking/domain/value-objects/elo-rating.vo.spec.ts`
    - **Property 8: EloRating Conservation** — `eloRatingArb` generates pairs `(homeVal, awayVal)` in `[0, 3000]`; after `recalculate` for both heroes `|( homeVal + awayVal) − (newHome + newAway)| <= 20` — **Validates: Requirements 8.2, 8.8, 13.4**
    - File: `src/modules/ranking/domain/aggregates/user-hero.aggregate.spec.ts`
    - **Property 10: UserHero Level Cap Enforcement** — generate `(level, atk, def, hp, spd, critRate)` where sum > level; assert `allocatePoints` throws `ExceedsLevelCapException` and state is unchanged — **Validates: Requirements 8.3**
    - _Requirements: 13.4_

- [x] 9. Ranking BC — Application, Infrastructure, and Presentation

  - [x] 9.1 Create Ranking command handlers

    - `challenge/challenge.command.ts` + `challenge.handler.ts`: load both `UserHero` aggregates; call `CombatEngine.simulate`; compute new ratings via `EloRating.recalculate`; call `applyEloResult` on both; persist both; persist `EloMatch`
    - `level-up-user-hero/level-up-user-hero.command.ts` + `level-up-user-hero.handler.ts`: dispatch `DeductBalanceCommand(userId, 2^(level+1))`; if it throws, do not increment level; call `userHero.levelUp()`; save
    - `allocate-points/allocate-points.command.ts` + `allocate-points.handler.ts`: call `userHero.allocatePoints(...)`; save
    - _Requirements: 8.3, 8.4, 8.5, 2.6_

  - [x] 9.2 Create Ranking query handlers

    - `get-leaderboard/`: accepts `{ page, limit }`; calls `IUserHeroRepository.findLeaderboard(options)`; returns paginated list ordered by ELO descending
    - `get-user-hero/`: accepts `userId`; calls `IUserHeroRepository.findByUserId`
    - `get-elo-match-history/`: accepts `userId`; calls `IEloMatchRepository.findByUserId`
    - _Requirements: 8.6, 2.7_

  - [x] 9.3 Create Ranking ORM entities and TypeORM repositories

    - `src/modules/ranking/infrastructure/persistence/typeorm/user-hero.orm-entity.ts`: `@Entity('user_heroes')` matching existing schema
    - `src/modules/ranking/infrastructure/persistence/typeorm/elo-match.orm-entity.ts`: `@Entity('elo-matches')` matching existing schema
    - `src/modules/ranking/infrastructure/persistence/typeorm/user-gem.orm-entity.ts`: `@Entity('user_gems')` matching existing schema; needed for the `AddGemCommand` side effect
    - `src/modules/ranking/infrastructure/persistence/typeorm/user-hero.repository.ts`: implements `IUserHeroRepository`; `findLeaderboard` orders by `elo DESC` with `take`/`skip`
    - `src/modules/ranking/infrastructure/persistence/typeorm/elo-match.repository.ts`: implements `IEloMatchRepository`
    - _Requirements: 9.2, 9.3, 9.4, 15.1_

  - [x] 9.4 Create Ranking presentation layer

    - `src/modules/ranking/presentation/http/user-hero.controller.ts`: `GET /user-heroes/me` → `GetUserHeroQuery`; `POST /user-heroes/level-up` → `LevelUpUserHeroCommand`; `POST /user-heroes/allocate` → `AllocatePointsCommand`
    - `src/modules/ranking/presentation/http/elo-match.controller.ts`: `POST /elo-matches/challenge` → `ChallengeCommand`; `GET /elo-matches/history` → `GetEloMatchHistoryQuery`; `GET /elo-matches/leaderboard` → `GetLeaderboardQuery`
    - _Requirements: 1.5, 2.2, 2.3_

  - [x] 9.5 Create `RankingModule`
    - `src/modules/ranking/ranking.module.ts`: import `CqrsModule`, `CombatModule`, `IdentityModule`, `TypeOrmModule.forFeature([UserHeroOrmEntity, EloMatchOrmEntity, UserGemOrmEntity])`; register all handlers; bind repository tokens; export `CqrsModule`
    - _Requirements: 1.6, 11.1_

- [x] 10. SocketGateway — shared infrastructure

  - [x] 10.1 Create SocketGateway in shared infrastructure

    - `src/shared/infrastructure/socket/socket.gateway.ts`: `@WebSocketGateway()` class decorated with `@Injectable()`; subscribe to `MatchCreatedEvent`, `FightingStartedEvent`, `MatchEndedEvent` via `@EventsHandler` decorators from `@nestjs/cqrs`
    - `MatchCreatedEvent` → `server.to('match').emit('betting', { matchId, heroInfo, status, startTime })`
    - `FightingStartedEvent` → `server.to('match').emit('matching', { matchId, status })`
    - `MatchEndedEvent` → `server.to('all').emit('reward', { winnerBets })`
    - Gateway must NOT inject `CommandBus`, `QueryBus`, or any domain service
    - _Requirements: 10.1, 10.2, 10.4, 10.5, 10.6, 3.5, 3.6, 3.7_

  - [x] 10.2 Create `SocketModule` with Redis adapter
    - `src/shared/infrastructure/socket/socket.module.ts`: configure `socket.io-redis` adapter using `REDIS_HOST` and `REDIS_PORT` env vars; export `SocketGateway`
    - _Requirements: 10.3_

- [x] 11. AppModule refactor

  - [x] 11.1 Create shared infrastructure modules: `DatabaseModule`, `RedisModule`, `QueueModule`

    - `src/shared/infrastructure/database/database.module.ts`: wrap `TypeOrmModule.forRootAsync(typeormConfigAsync)`
    - `src/shared/infrastructure/redis/redis.module.ts`: wrap `RedisModule.forRootAsync(redisConfigAsync)`; export redis client
    - `src/shared/infrastructure/queue/queue.module.ts`: wrap `BullModule.forRootAsync(queueConfigAsync)` and register both queues (`'socket.io'`, `'bet'`)
    - _Requirements: 11.1_

  - [x] 11.2 Rewrite `AppModule` as an orchestration shell
    - Replace the entire existing `src/app.module.ts` with a minimal `@Module` that imports only: `ConfigModule.forRoot({ isGlobal: true })`, `ScheduleModule.forRoot()`, `DatabaseModule`, `RedisModule`, `QueueModule`, `SocketModule`, `IdentityModule`, `HeroCatalogModule`, `BettingModule`, `RankingModule`, `CombatModule`
    - Remove all individual providers, controllers, and repositories from `AppModule`
    - Keep `exports: [MatchService]` stub re-exported from `BettingModule` only until cleanup task removes it
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 12. Checkpoint — build and test validation

  - Run `npm run build` (or `npx nest build`) to verify TypeScript compilation succeeds across all new modules
  - Run `npx jest --testPathPattern="spec.ts" --passWithNoTests` to execute all unit and property-based tests
  - Fix any type errors or import resolution failures before proceeding to cleanup
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Cleanup: remove legacy code

  - [x] 13.1 Delete legacy `src/app/` directory

    - Remove the entire `src/app/` tree; all logic has been migrated to `src/modules/`
    - _Requirements: 1.1_

  - [x] 13.2 Delete `src/migrations/entities/` and `src/migrations/interfaces/`

    - ORM entities now live in each BC's `infrastructure/persistence/typeorm/` folder
    - _Requirements: 9.5, 15.1_

  - [x] 13.3 Delete `src/core/` legacy utilities

    - Remove `src/core/typeorm/`, `src/core/validator/`, `src/core/consoles/` — these were monolith-era utilities whose roles are covered by the new module structure
    - _Requirements: 1.1_

  - [-] 13.4 Final build verification
    - Run `npm run build` after cleanup; it must succeed with zero errors
    - Remove the `exports: [MatchService]` backward-compat stub from `BettingModule` once confirmed no remaining consumers reference it
    - _Requirements: 11.3, 11.4_

- [~] 14. Final checkpoint — full test suite
  - Run all property-based and unit tests: `npx jest --testPathPattern="spec.ts"`
  - All 10 property tests (Properties 1–10) must pass
  - All unit tests for command handlers, query handlers, and aggregates must pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP delivery
- The dependency ordering enforces: Combat (task 2) → HeroCatalog (task 3) + Identity (task 4) in parallel → Betting (tasks 5–7) → Ranking (tasks 8–9) → AppModule wiring (tasks 10–11) → Cleanup (task 13)
- Cross-context command dispatch (e.g., `PlaceBetHandler` calling `DeductBalanceCommand`) works because all BCs import `CqrsModule` and the `CommandBus` is global within a NestJS application when `CqrsModule` is registered globally
- No database migrations are generated or run as part of this refactor; all ORM entities preserve existing table and column names
- Property tests use fast-check with `numRuns: 100` minimum; generators should produce edge cases (zero HP after first hit, equal SPD, single-bet matches)
- Each property test file is co-located with the source file it tests, following NestJS convention

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "2.4"] },
    { "id": 3, "tasks": ["2.5"] },
    { "id": 4, "tasks": ["2.6"] },
    { "id": 5, "tasks": ["2.7", "3.1", "4.1", "4.2"] },
    { "id": 6, "tasks": ["3.2", "3.3", "4.3", "4.4", "4.5"] },
    { "id": 7, "tasks": ["3.4", "3.5", "4.6", "4.7", "4.8"] },
    { "id": 8, "tasks": ["4.9", "4.10", "4.11"] },
    { "id": 9, "tasks": ["5.1", "5.2"] },
    { "id": 10, "tasks": ["5.3", "5.4", "5.5"] },
    { "id": 11, "tasks": ["5.6", "6.1", "6.2"] },
    { "id": 12, "tasks": ["6.3", "7.1"] },
    { "id": 13, "tasks": ["7.2", "7.3"] },
    { "id": 14, "tasks": ["7.4"] },
    { "id": 15, "tasks": ["8.1", "8.2"] },
    { "id": 16, "tasks": ["8.3", "8.4"] },
    { "id": 17, "tasks": ["8.5", "9.1", "9.2"] },
    { "id": 18, "tasks": ["9.3", "9.4"] },
    { "id": 19, "tasks": ["9.5"] },
    { "id": 20, "tasks": ["10.1"] },
    { "id": 21, "tasks": ["10.2", "11.1"] },
    { "id": 22, "tasks": ["11.2"] },
    { "id": 23, "tasks": ["13.1", "13.2", "13.3"] },
    { "id": 24, "tasks": ["13.4"] }
  ]
}
```
