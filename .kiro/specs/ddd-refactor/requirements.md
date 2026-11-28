# Requirements Document

## Introduction

This document specifies the requirements for a full Domain-Driven Design (DDD) refactor of the game-be NestJS backend. The current codebase is a flat monolith: all providers and controllers are registered in a single `AppModule`, entities co-locate TypeORM and GraphQL decorators, business logic is scattered across service classes with mutable instance state, and the combat simulation engine is duplicated between `RoundService` and `EloMatchService`.

The refactor restructures the codebase into four Bounded Contexts (Identity, HeroCatalog, Betting, Ranking) plus one Shared Kernel (Combat), each in its own NestJS feature module with explicit DDD layers: **domain**, **application**, **infrastructure**, and **presentation**. CQRS via `@nestjs/cqrs` replaces direct service calls for all state-changing and query operations. No backward compatibility is required; this is a greenfield replacement of the existing service layer.

---

## Glossary

- **Aggregate**: A cluster of domain objects treated as a single unit with one root entity that controls all mutations.
- **AggregateRoot**: The entry point of an aggregate; extends `AggregateRoot` from `@nestjs/cqrs` to record domain events.
- **Application Layer**: Thin orchestration layer containing command handlers, query handlers, and application services. Contains no domain logic.
- **Bet**: An entity inside the `BettingMatch` aggregate boundary representing a single user wager on a hero for a given match.
- **BettingMatch**: The aggregate root for the Betting BC. Owns the match lifecycle state machine.
- **BettingMatch_Status**: Enum value — one of `PENDING`, `BETTING`, `FIGHTING`, or `END`.
- **Bounded_Context**: An explicit boundary within which a domain model applies consistently, implemented as a NestJS feature module.
- **CombatEngine**: A stateless domain service in the Combat Shared Kernel that runs the turn-based simulation between two `HeroSnapshot` inputs and returns a `CombatResult`.
- **CombatResult**: An immutable value object produced by `CombatEngine`, containing `winnerId`, `loserId`, `turns` array, and `turnNumber`.
- **Command**: A CQRS intent object handled by exactly one `CommandHandler`.
- **CommandBus**: The `@nestjs/cqrs` bus that dispatches commands to their handlers.
- **CQRS**: Command Query Responsibility Segregation — separating write operations (commands) from read operations (queries).
- **Domain_Event**: A named fact that something happened in the domain, published after a successful state change.
- **Domain_Layer**: The innermost layer containing aggregates, value objects, domain services, and repository interfaces. Has zero infrastructure dependencies.
- **EloMatch**: An entity recording the outcome of a single player-vs-player ranked match.
- **EloRating**: A value object wrapping a numeric ELO score, encapsulating the `@studimax/elo` recalculation formula.
- **EventBus**: The `@nestjs/cqrs` bus that dispatches domain events to their handlers.
- **HeroCatalog_BC**: The Bounded Context managing hero master data.
- **HeroSnapshot**: An immutable value object capturing the full combat stats of a hero at the moment a combat simulation begins.
- **Identity_BC**: The Bounded Context managing user accounts, authentication, and wallet balance.
- **Infrastructure_Layer**: Contains TypeORM ORM models, repository implementations, Bull queue producers/consumers, Redis adapters, and Socket.IO gateway.
- **ORM_Model**: A TypeORM `@Entity`-decorated class used only in the infrastructure layer. Never exposes domain types to the persistence layer.
- **Presentation_Layer**: Contains NestJS controllers, GraphQL resolvers, and DTOs. Translates HTTP/GraphQL input into commands and queries.
- **Query**: A CQRS read object handled by exactly one `QueryHandler`. Must not mutate state.
- **QueryBus**: The `@nestjs/cqrs` bus that dispatches queries to their handlers.
- **Ranking_BC**: The Bounded Context managing ELO-based player-vs-player matches and the leaderboard.
- **Repository_Interface**: A domain-layer interface defining persistence operations for an aggregate. Infrastructure implementations are injected via NestJS DI tokens.
- **RewardPolicy**: A domain service in the Betting BC that calculates winner payouts and gem drop probability.
- **Shared_Kernel**: Code shared across Bounded Contexts with an explicit, versioned contract — here the Combat simulation logic. Contains no aggregates, domain events, commands, or queries.
- **SkillRegistry**: A registry in the Combat Shared Kernel that maps a hero name string to its `SkillStrategy` implementation.
- **SkillStrategy**: An interface with a single `apply(attacker, defender)` method, implemented once per hero (11 heroes). Replaces the current `switch/case` in `SkillFactory`.
- **User**: The aggregate root for the Identity BC, owning account credentials and a `Wallet` value object.
- **UserHero**: The aggregate root for the Ranking BC, owning a hero's leveled stats, skill-point allocation, and `EloRating`.
- **Value_Object**: An immutable domain object identified by its attributes, not by an ID.
- **Wallet**: A value object inside the `User` aggregate that holds the numeric balance and enforces the non-negative invariant.

---

## Requirements

---

### Requirement 1: Layered Module Structure

**User Story:** As a developer, I want each Bounded Context to have an explicit four-layer folder structure, so that domain logic is never coupled to infrastructure or presentation concerns.

#### Acceptance Criteria

1. THE Codebase SHALL organize each Bounded Context under `src/<bc-name>/` with four sub-folders: `domain/`, `application/`, `infrastructure/`, and `presentation/`.
2. THE Domain_Layer SHALL contain no imports from NestJS modules other than `@nestjs/cqrs`, and no imports from TypeORM, Bull, Redis, or Socket.IO packages.
3. THE Application_Layer SHALL contain no direct instantiation of TypeORM repositories, Bull queues, or Redis clients; all infrastructure dependencies SHALL be injected via Repository_Interface tokens or application service interfaces.
4. THE Infrastructure_Layer SHALL contain no domain logic; balance arithmetic, reward calculation, and combat simulation SHALL reside exclusively in the Domain_Layer or Shared_Kernel.
5. THE Presentation_Layer SHALL translate incoming HTTP or GraphQL input into Command or Query objects before delegating to the CommandBus or QueryBus; it SHALL NOT call application services directly.
6. WHEN a new Bounded Context module is added, THE AppModule SHALL import only the top-level NestJS feature module for that context, with no individual providers registered directly in AppModule.

---

### Requirement 2: CQRS Command and Query Buses

**User Story:** As a developer, I want all state changes issued as commands and all reads issued as queries through the `@nestjs/cqrs` buses, so that every operation has a single, traceable handler.

#### Acceptance Criteria

1. THE System SHALL install and configure `CqrsModule` from `@nestjs/cqrs` as a global or per-context module so that `CommandBus` and `QueryBus` are injectable everywhere.
2. WHEN a Presentation_Layer endpoint triggers a write operation, THE Presentation_Layer SHALL dispatch exactly one Command object via CommandBus and SHALL NOT call any service method directly.
3. WHEN a Presentation_Layer endpoint triggers a read operation, THE Presentation_Layer SHALL dispatch exactly one Query object via QueryBus and SHALL NOT call any repository method directly.
4. THE System SHALL register exactly one `CommandHandler` per Command class; THE System SHALL register exactly one `QueryHandler` per Query class.
5. IF a CommandHandler throws a domain exception, THEN THE CommandBus SHALL propagate the exception to the Presentation_Layer without wrapping it in an additional infrastructure error type.
6. THE System SHALL define the following commands across all Bounded Contexts: `RegisterUserCommand`, `LoginCommand`, `DeductBalanceCommand`, `CreditBalanceCommand`, `StartMatchCommand`, `PlaceBetCommand`, `ResolveFightingCommand`, `ResolveRewardCommand`, `ChallengeCommand`, `LevelUpUserHeroCommand`, `AllocatePointsCommand`.
7. THE System SHALL define the following queries across all Bounded Contexts: `GetUserQuery`, `GetUserByEmailQuery`, `GetHeroQuery`, `GetHeroPairQuery`, `ListHeroesQuery`, `GetCurrentMatchQuery`, `GetMatchHistoryQuery`, `GetBetByUserAndMatchQuery`, `GetMatchStatisticsQuery`, `GetLeaderboardQuery`, `GetUserHeroQuery`, `GetEloMatchHistoryQuery`.

---

### Requirement 3: Domain Events and Event Handlers

**User Story:** As a developer, I want domain state changes to publish typed events, so that cross-context side effects (socket broadcasts, balance updates) are decoupled from the originating command handler.

#### Acceptance Criteria

1. THE BettingMatch AggregateRoot SHALL publish a `MatchCreatedEvent` after a new match is saved with status `BETTING`.
2. THE BettingMatch AggregateRoot SHALL publish a `FightingStartedEvent` after the match status transitions to `FIGHTING`.
3. THE BettingMatch AggregateRoot SHALL publish a `MatchEndedEvent` after the match status transitions to `END` and rewards have been calculated.
4. THE BettingMatch AggregateRoot SHALL publish a `BetPlacedEvent` after a `Bet` is successfully added to the aggregate.
5. WHEN a `MatchCreatedEvent` is handled, THE SocketGateway SHALL broadcast event `"betting"` to room `"match"` with the match data payload.
6. WHEN a `FightingStartedEvent` is handled, THE SocketGateway SHALL broadcast event `"matching"` to room `"match"` with the match data payload.
7. WHEN a `MatchEndedEvent` is handled, THE SocketGateway SHALL broadcast event `"reward"` to room `"all"` with the winners' bet data, and THE RewardEventHandler SHALL dispatch `CreditBalanceCommand` to the Identity_BC for each winning bet.
8. WHEN a `BetPlacedEvent` is handled, THE RewardEventHandler SHALL NOT perform any action; the event SHALL be persisted in the event log for auditability only.
9. THE System SHALL NOT use `EventEmitter2` for domain event dispatch; all domain events SHALL be published via the `EventBus` from `@nestjs/cqrs`.

---

### Requirement 4: Identity Bounded Context

**User Story:** As a developer, I want user accounts and balance management isolated in an Identity BC, so that authentication and wallet logic are not spread across other contexts.

#### Acceptance Criteria

1. THE Identity_BC SHALL define a `User` AggregateRoot containing `id`, `email`, `passwordHash`, `role`, `confirmedEmail` flag, and a `Wallet` Value_Object.
2. THE Wallet Value_Object SHALL encapsulate `balance` as a non-negative integer and SHALL expose `deduct(amount)` and `credit(amount)` methods that return a new `Wallet` instance.
3. IF a `deduct(amount)` call is made where `amount` exceeds the current balance, THEN THE Wallet SHALL throw an `InsufficientFundsException` domain error without mutating state.
4. THE `DeductBalanceCommand` handler SHALL load the `User` aggregate, call `Wallet.deduct(amount)`, persist the updated aggregate, and return the new balance.
5. THE `CreditBalanceCommand` handler SHALL load the `User` aggregate, call `Wallet.credit(amount)`, persist the updated aggregate, and return the new balance.
6. THE Identity_BC SHALL define a `IUserRepository` interface in the domain layer with at minimum: `findById(id)`, `findByEmail(email)`, `save(user)`.
7. THE `RegisterUserCommand` handler SHALL hash the password before persisting the `User` aggregate via `IUserRepository`.
8. THE `LoginCommand` handler SHALL verify the password hash and return a signed JWT; it SHALL NOT store session state.
9. WHEN any Identity_BC command or query mutates or reads the `User` aggregate, THE handler SHALL use `IUserRepository` and SHALL NOT query the `users` table directly via TypeORM in the application or domain layers.

---

### Requirement 5: HeroCatalog Bounded Context

**User Story:** As a developer, I want hero master data managed by a dedicated BC, so that read-heavy hero queries are isolated from combat and ranking logic.

#### Acceptance Criteria

1. THE HeroCatalog_BC SHALL define a `Hero` AggregateRoot containing `id`, `name`, `element`, `position`, `story`, `guide`, `skill` (string descriptor), and a `HeroStats` Value_Object.
2. THE `HeroStats` Value_Object SHALL contain all numeric combat attributes: `hp`, `atk`, `def`, `spd`, `critRate`, `critDmg`, `atkHealing`, `takeDmgHealing`, `dodge`, `acc`, `cc`, `effectResistance`, `intrinsicStatus`.
3. THE HeroCatalog_BC SHALL define a `IHeroRepository` interface with at minimum: `findById(id)`, `findByName(name)`, `getPair()`, `listAll()`.
4. WHEN `GetHeroPairQuery` is handled, THE HeroCatalog_QueryHandler SHALL return exactly two `Hero` aggregates selected according to the existing random-pair logic in `HeroRepository.getPairHeroes()`.
5. THE HeroCatalog_BC ORM_Model SHALL map to the existing `heroes` table with no schema changes.
6. THE HeroCatalog_BC SHALL expose heroes via both REST (`GET /heroes`) and GraphQL (`heroes` query) in its Presentation_Layer.

---

### Requirement 6: Combat Shared Kernel

**User Story:** As a developer, I want the turn-based combat simulation extracted into a stateless shared kernel, so that both the Betting BC and Ranking BC use a single, tested implementation with no duplicated logic.

#### Acceptance Criteria

1. THE CombatEngine SHALL be a stateless domain service with a single public method: `simulate(home: HeroSnapshot, away: HeroSnapshot): CombatResult`.
2. THE `simulate` method SHALL run at most 20 turns; THE CombatEngine SHALL terminate the loop and determine the winner by remaining HP when `turn_number` reaches 20.
3. THE HeroSnapshot Value_Object SHALL be immutable; `simulate` SHALL NOT mutate the input `HeroSnapshot` instances.
4. THE CombatResult Value_Object SHALL contain: `winnerId`, `loserId`, `turns` (array of per-turn snapshots), and `turnNumber` (total turns executed).
5. THE SkillRegistry SHALL map each of the 11 hero names (`Hell`, `Sphinx`, `Darklord`, `Valkyrie`, `Poseidon`, `Phoenix`, `Chiron`, `Hera`, `Fenrir`, `Amon`, `Nezha`) to a unique `SkillStrategy` implementation.
6. THE SkillStrategy interface SHALL define a single method: `apply(attacker: HeroSnapshot, defender: HeroSnapshot): [HeroSnapshot, HeroSnapshot]`.
7. IF `CombatEngine.simulate` receives a hero name not registered in SkillRegistry, THEN THE CombatEngine SHALL throw an `UnknownHeroSkillException`.
8. THE Combat Shared Kernel SHALL contain no NestJS `@Injectable` decorators in its domain-level classes (CombatEngine, HeroSnapshot, CombatResult, SkillStrategy implementations); it SHALL be instantiatable in pure Node.js unit tests with no NestJS bootstrapping.
9. THE Combat Shared Kernel SHALL be published as a NestJS module (`CombatModule`) that exports `CombatEngine` as an injectable provider so that the Betting BC and Ranking BC can import it.
10. FOR ALL valid pairs of `HeroSnapshot` inputs, THE CombatEngine SHALL produce a `CombatResult` where `turnNumber` is greater than or equal to 1 and less than or equal to 20 (termination property).

---

### Requirement 7: Betting Bounded Context

**User Story:** As a developer, I want automated betting matches managed by a dedicated BC, so that the match lifecycle, bet placement, and reward distribution are governed by a single aggregate with explicit state transitions.

#### Acceptance Criteria

1. THE BettingMatch AggregateRoot SHALL enforce the state machine: initial state is `PENDING`; valid transitions are `PENDING → BETTING`, `BETTING → FIGHTING`, and `FIGHTING → END`; all other transitions SHALL throw an `InvalidMatchTransitionException`.
2. THE `StartMatchCommand` handler SHALL invoke `CombatEngine.simulate` with the selected hero pair, persist the `BettingMatch` aggregate with the pre-computed `CombatResult`, and set status to `BETTING`.
3. THE `PlaceBetCommand` handler SHALL add a `Bet` entity to the `BettingMatch` aggregate only while status is `BETTING`; IF status is not `BETTING`, THEN THE handler SHALL throw a `BettingClosedException`.
4. WHEN `PlaceBetCommand` is handled successfully, THE handler SHALL dispatch `DeductBalanceCommand` to the Identity_BC CommandBus before persisting the `Bet`.
5. IF `DeductBalanceCommand` throws `InsufficientFundsException`, THEN THE `PlaceBetCommand` handler SHALL abort and re-throw the exception without persisting the `Bet`.
6. THE `ResolveFightingCommand` handler SHALL transition the `BettingMatch` from `BETTING` to `FIGHTING` exactly 1 minute after `StartMatchCommand` completes; this delay SHALL be implemented via Bull queue delayed job, not via `setTimeout`.
7. THE `ResolveRewardCommand` handler SHALL transition the `BettingMatch` from `FIGHTING` to `END`, apply `RewardPolicy`, and dispatch `CreditBalanceCommand` to the Identity_BC for each winning bet.
8. THE RewardPolicy domain service SHALL calculate winner payout as `bet.balance × 2`; THE total payout for a match SHALL NOT exceed the sum of all bets on the winning hero multiplied by 2.
9. THE RewardPolicy domain service SHALL apply a gem drop check per winning bet using the existing drop-chance constant; IF the check passes, THEN THE RewardPolicy SHALL dispatch `AddGemCommand` to the Ranking_BC.
10. THE PreMatchCron (@Cron `0 */3 * * * *`) SHALL dispatch `StartMatchCommand` every 3 minutes; THE cron class SHALL reside in the infrastructure layer of the Betting BC and SHALL NOT contain any domain logic.
11. THE Betting_BC SHALL define `IBettingMatchRepository` with at minimum: `findById(id)`, `save(match)`, `findCurrentMatchId()`.
12. THE Betting_BC SHALL define `IBetRepository` with at minimum: `findByMatchAndHero(matchId, heroId)`, `findByMatchAndUser(matchId, userId)`.

---

### Requirement 8: Ranking Bounded Context

**User Story:** As a developer, I want ELO-based player-vs-player matches managed by a Ranking BC, so that leaderboard standings and hero progression are isolated from the automated betting system.

#### Acceptance Criteria

1. THE UserHero AggregateRoot SHALL contain `id`, `userId`, `heroId`, `level`, skill-point allocations (`atkPoint`, `defPoint`, `hpPoint`, `spdPoint`, `critRatePoint`), computed combat stats, and an `EloRating` Value_Object with initial value `1600`.
2. THE EloRating Value_Object SHALL use `@studimax/elo` with `kFactor: 20` to compute new ratings; `EloRating.recalculate(opponentRating, outcome)` SHALL return a new `EloRating` instance without mutating state.
3. THE `AllocatePointsCommand` handler SHALL enforce that the sum of all allocated skill points does not exceed the `UserHero.level`; IF the sum exceeds the level, THEN THE handler SHALL throw an `ExceedsLevelCapException`.
4. THE `LevelUpUserHeroCommand` handler SHALL deduct `2^(level + 1)` tokens from the user's Wallet via `DeductBalanceCommand` before incrementing `UserHero.level`; IF `DeductBalanceCommand` throws, THEN THE level SHALL NOT be incremented.
5. THE `ChallengeCommand` handler SHALL: (a) load both `UserHero` aggregates; (b) invoke `CombatEngine.simulate`; (c) call `EloRating.recalculate` for both heroes; (d) persist both updated `UserHero` aggregates; (e) persist a new `EloMatch` entity.
6. THE `GetLeaderboardQuery` handler SHALL return `UserHero` records ordered by `EloRating` descending, with pagination.
7. THE Ranking_BC SHALL define `IUserHeroRepository` with at minimum: `findById(id)`, `findByUserId(userId)`, `save(userHero)`, `findLeaderboard(options)`.
8. FOR ALL `ChallengeCommand` executions, the sum `home.eloRating + away.eloRating` before and after SHALL differ by no more than the maximum ELO transfer permitted by `kFactor: 20` (conservation property).

---

### Requirement 9: Repository Interfaces and Infrastructure Implementations

**User Story:** As a developer, I want all domain layers to depend on repository interfaces rather than TypeORM classes, so that the infrastructure can be swapped or mocked without changing domain or application logic.

#### Acceptance Criteria

1. THE Domain_Layer of each Bounded Context SHALL define a repository interface using a TypeScript `interface` keyword with an injection token exported as a `const` symbol.
2. THE Infrastructure_Layer of each Bounded Context SHALL provide a TypeORM class that implements the domain repository interface, bound to the injection token via NestJS `useClass` provider.
3. THE Domain_Layer repository interfaces SHALL accept and return domain aggregate types (e.g., `User`, `BettingMatch`), never ORM model types (e.g., `UserEntity`, `MatchEntity`).
4. THE Infrastructure_Layer repository implementations SHALL map between ORM_Model rows and domain aggregate instances; this mapping logic SHALL reside entirely within the infrastructure layer.
5. THE System SHALL define separate ORM_Model classes for infrastructure use; existing entity classes in `src/migrations/entities/` SHALL be migrated to `src/<bc-name>/infrastructure/orm/` within their respective Bounded Context.
6. WHEN a repository implementation needs raw SQL for statistics queries (currently in `MatchService.statistic`), THE raw SQL SHALL remain in the infrastructure repository implementation and SHALL be exposed through the domain `IMatchRepository` interface as a typed method, not as a pass-through query string.

---

### Requirement 10: Socket.IO Presentation Layer

**User Story:** As a developer, I want Socket.IO broadcasts decoupled from business logic via domain event handlers, so that the gateway only concerns itself with connection management and message dispatch.

#### Acceptance Criteria

1. THE SocketGateway SHALL reside in a shared infrastructure module and SHALL subscribe to domain events via the EventBus.
2. THE SocketGateway SHALL NOT import any CommandBus, QueryBus, or domain service directly; all gateway behavior SHALL be driven by received domain events.
3. THE SocketGateway SHALL use the Redis adapter (`socket.io-redis`) for multi-instance compatibility; the Redis connection details SHALL be sourced from environment variables.
4. WHEN THE SocketGateway broadcasts a `"betting"` event, THE payload SHALL include `matchId`, `heroInfo`, `status`, and `startTime`.
5. WHEN THE SocketGateway broadcasts a `"matching"` event, THE payload SHALL include `matchId` and `status`.
6. WHEN THE SocketGateway broadcasts a `"reward"` event to room `"all"`, THE payload SHALL include the list of winning bets with `userId` and `payout`.

---

### Requirement 11: AppModule Decomposition

**User Story:** As a developer, I want AppModule reduced to an orchestration shell, so that it imports feature modules but registers no business providers directly.

#### Acceptance Criteria

1. THE AppModule SHALL import the following feature modules and no other business providers: `IdentityModule`, `HeroCatalogModule`, `BettingModule`, `RankingModule`, `CombatModule`, and shared infrastructure modules (`DatabaseModule`, `RedisModule`, `QueueModule`, `SocketModule`).
2. THE AppModule SHALL contain zero `providers` entries that are application services, domain services, command handlers, query handlers, or repositories.
3. WHEN a feature module is removed from the imports list, THE remaining modules SHALL continue to compile and start without errors, provided their cross-context dependencies are mocked.
4. THE System SHALL continue to export the `MatchService` symbol from `BettingModule` for backward-compatible imports during the transition period; once all consumers are migrated, this export SHALL be removed.

---

### Requirement 12: CombatEngine Statelessness

**User Story:** As a developer, I want the CombatEngine to be stateless, so that concurrent match simulations cannot corrupt each other's turn data.

#### Acceptance Criteria

1. THE CombatEngine SHALL hold no instance variables that persist across calls to `simulate`; all simulation state SHALL be declared as local variables within the `simulate` method.
2. WHEN `simulate` is called concurrently with two different hero pairs, THE results SHALL be independent and neither SHALL contain turn data from the other call.
3. THE existing `RoundService` and `EloMatchService` mutable instance variables (`home`, `away`, `turn_number`, `turns`, `hero_info`) SHALL be eliminated; both services SHALL delegate to `CombatEngine.simulate`.
4. FOR ALL valid `HeroSnapshot` pairs, calling `CombatEngine.simulate(home, away)` SHALL produce the same `CombatResult` structure (same winner determination logic) as calling `CombatEngine.simulate(away, home)` with home and away swapped, accounting for speed-based turn order.

---

### Requirement 13: Correctness Properties

**User Story:** As a developer, I want key domain invariants expressed as property-based tests, so that regressions in combat termination, state transitions, balance integrity, ELO conservation, and reward soundness are caught automatically.

#### Acceptance Criteria

1. THE CombatEngine SHALL be tested with a property that for all valid `HeroSnapshot` pair inputs, `CombatResult.turnNumber` is always in the range `[1, 20]` inclusive (termination invariant).
2. THE BettingMatch state machine SHALL be tested with a property that for all valid event sequences, the status value never decreases (monotonic state invariant); specifically, a match with status `END` SHALL reject any transition command.
3. THE Wallet SHALL be tested with a property that for all valid sequences of `deduct` and `credit` operations where no individual `deduct` causes `InsufficientFundsException`, the final balance equals the initial balance plus all credited amounts minus all deducted amounts (balance conservation property).
4. THE EloRating SHALL be tested with a property that for all valid `(homeRating, awayRating, outcome)` inputs, the absolute difference between `(homeRating + awayRating)` before and `(newHomeRating + newAwayRating)` after is less than or equal to `kFactor` (ELO sum conservation property).
5. THE RewardPolicy SHALL be tested with a property that for all valid bet lists and a winner hero, the total payout calculated by `RewardPolicy` is less than or equal to the sum of winning bet amounts multiplied by 2 (no-money-creation property).
6. WHEN property tests for `CombatEngine` termination are run, THE test SHALL generate at least 100 random `HeroSnapshot` pair inputs using the property-based testing library.
7. WHEN property tests for `Wallet` balance conservation are run, THE test SHALL generate sequences of at least 10 random `deduct`/`credit` operations per test case.

---

### Requirement 14: GraphQL Schema Preservation

**User Story:** As a developer, I want the existing GraphQL schema shape preserved after the refactor, so that front-end clients require no changes.

#### Acceptance Criteria

1. THE refactored Presentation_Layer SHALL expose the same GraphQL type names and field names currently defined in `schema.gql` for all types that are part of the public API.
2. THE GraphQL resolvers SHALL reside in the `presentation/` folder of their respective Bounded Context module.
3. THE GraphQL resolvers SHALL accept `@Args()` input and dispatch the corresponding Command or Query via CommandBus or QueryBus; they SHALL NOT call domain services directly.
4. WHEN THE GraphQL schema is auto-generated via code-first mode after the refactor, the resulting schema SHALL be semantically equivalent to `schema.gql` for all resolver-backed types.

---

### Requirement 15: Database Schema Stability

**User Story:** As a developer, I want the database schema to remain unchanged during the refactor, so that no data migrations are needed and the deployment is non-destructive.

#### Acceptance Criteria

1. THE refactored ORM_Model classes SHALL map to the same table names and column names currently used: `users`, `heroes`, `matches`, `elo-matches`, `bets`, `user_heroes`, `user_gems`.
2. THE System SHALL NOT generate any TypeORM migration files that perform `ALTER TABLE`, `DROP COLUMN`, or `RENAME COLUMN` operations as part of this refactor.
3. THE TypeORM `synchronize` option SHALL remain `false` in production configuration after the refactor.
4. WHEN the application starts after the refactor, THE TypeORM connection SHALL succeed against the existing database schema without schema drift errors.
