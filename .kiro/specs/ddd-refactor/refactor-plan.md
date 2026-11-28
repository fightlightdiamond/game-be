# Refactor plan

Bring `src/modules` onto the model in [strategic-design.md](./strategic-design.md), the rules in [concepts.md](./concepts.md), and the words in [ubiquitous-language.md](./ubiquitous-language.md).

Each step finishes before the next one starts. A step is finished when its domain types use the words in the ubiquitous language and its tests cover the rules named below.

## Held fixed

- `accounts.balance` is the Balance. `stakes.amount` is the stake. `house_matches.phase` stores `Open`, `Revealed`, and `Settled`.
- A domain type does not import `@nestjs/*`, `bcrypt`, `bull`, or `typeorm`.
- House betting does not import roster or account. It calls a ledger port. Gems wake up on `RewardsPaid`.
- HTTP paths may stay. The controller translates them into the verbs below. The domain method is not named after the old path.

## 1. Combat

Replace the port that dropped max health.

- `HeroSnapshot` becomes `Fighter`, with max health, current health, base attack, current attack, base defense, and current defense.
- `Skill`, `SkillRegistry`, and `SkillStrategy` become `Trait` and a trait registry. The eleven formulas are the table in concepts.md. `Synthia` is not a trait.
- `simulate(home, away)` follows the original loop. A speed tie goes to away. The loop stops when the turn number reaches 20. Equal remaining health is a win for away. The blow is miss, then damage, then the Nezha step.
- Randomness comes from a `RandomSource` port. Tests pass a fixed sequence. `CombatEngine` is not `@Injectable`. Nest only wraps it in the module.

Done when a fixed roll reproduces one trait, a speed tie, an equal-health ending, and a fight that stops at turn 20, and the input fighters are unchanged.

## 2. Ledger

Take money off the account.

- New ledger module. `debit` and `credit` are one conditional update on `users.balance` by `AccountId`. An insufficient debit changes no row.
- Delete `Wallet`, `DeductBalanceCommand`, and `CreditBalanceCommand` from the account aggregate. Callers depend on the ledger port.
- The ledger writes `accounts.balance` only. It does not write name, email, or avatar.

Done when two concurrent debits cannot drive the balance negative, and a ledger save does not null a profile column.

## 3. House betting

Rename the match the account stakes on, and make the clock and the money one transaction.

- `BettingMatch` becomes `HouseMatch`. `Bet` becomes `Stake`. `amount` is the stake. Phases are `Open`, `Revealed`, `Settled`. The mapper keeps `PENDING`, `BETTING`, `FIGHTING`, and `END` in the column.
- `open` creates the match already `Open`, after `simulate`. The public winner and turn log are hidden. The stored `CombatResult` is complete. `toOrm` writes the stored result, not the public view.
- `placeStake` accepts one stake per account, only while `Open`, only on one of the two catalog heroes. The debit and the insert commit together. A unique `(accountId, matchId)` backs the rule.
- `reveal` at 2:00 publishes the winner and the log. It does not simulate again.
- `settle` at 5:00 credits `amount × 2` for each winning stake and marks `Settled` in the same transaction. A second settle pays nothing. `RewardsPaid` is published after that commit. This step does not drop a gem.
- The next match starts when this one settles. `open` enqueues reveal at 2 minutes and settle at 5 minutes. The delays are 2 minutes and 5 minutes, not 60 seconds and 180 seconds.
- Events are `BettingOpened`, `FightRevealed`, `RewardsPaid`, and `StakePlaced`. Delete `FightingStarted` and `MatchEnded` as the domain events.

Done when a stake during `Revealed` is refused, a saved open match still has its winner in the database, and replaying `settle` does not credit twice.

## 4. Catalog

Make the catalog a reader.

- `Hero` stays the catalog word. It is not an aggregate with rules.
- Pairing returns two distinct catalog heroes.
- The caller freezes a `Fighter`. The catalog does not import combat.

Done when a house match and a challenge can each build a `Fighter` from a catalog row without importing a catalog class into the combat module.

## 5. Roster

One owned hero, the real stat formulas, and gems after the payout.

- `UserHero` becomes `OwnedHero`. `claim` copies one catalog hero and refuses a second. Level starts at 0. The Elo number starts at 1600.
- `allocatePoints` uses the five formulas in concepts.md and refuses a sum above level.
- `levelUp` debits `2^(currentLevel + 1)` through the ledger port, then increases level by 1. A failed debit leaves the level unchanged.
- `challenge` calls `simulate` with the computed stats, including crit damage, dodge, and the other fighter fields. It does not pass zeros. Both Elo numbers are updated with `kFactor` 20. The word `EloRating` is not a type. `EloMatch` as a class name becomes `Challenge`. The table stays `elo-matches`.
- `drop` listens to `RewardsPaid`. A roll from 1 to 100 adds a level-1 gem of a random type when the roll is at most 5. `levelUpGem` spends storage for a chance at the next level. There is no `attach` and no `AddGem` command from house betting.

Done when a second claim is refused, a level-up from level 0 persists level 1, and a gem drop does not run inside `settle`.

## 6. Account and notification

Wrap what is already technical.

- `User` in the domain becomes `Account`: email, password, role, confirmation, address. No balance method.
- A successful login runs the login grant: first login of a calendar day in `Asia/Ho_Chi_Minh` creates a zero balance when missing, then `credit(100)` once.
- Notification emits `BettingOpened`, `FightRevealed`, and `RewardsPaid`. It does not open, reveal, or settle. The queue that waits those delays belongs to house betting.

Done when a second login on the same day does not credit, and a socket handler does not call a house-betting command.

## Leave in place

Do not add a `MatchType` that folds a challenge into `HouseMatch`. Do not delete a mapper's column until the step that owns that table has shipped.
