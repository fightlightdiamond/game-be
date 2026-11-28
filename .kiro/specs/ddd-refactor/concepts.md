# Concepts

Names in this file are the ones the refactor uses. They are taken from the business, not from the current class and column names. The spoken form of those names, and the class and method names, are in [ubiquitous-language.md](./ubiquitous-language.md). If a spelling disagrees, that file wins. [domain-theory.md](./domain-theory.md) defines what a concept, a rule, and data are. [strategic-design.md](./strategic-design.md) places these concepts in contexts. This file wins on whether a row is a concept, data, or a rule.

A row is a concept only when the business can say what it is without pointing at a table. A column, an id, or a service method is not a concept.

The physical table and column names are in the last section of this file.

## Combat

Core domain. Upstream supplier. Contract: `simulate(Fighter, Fighter) → CombatResult`.

These rules are the loop `RoundService` and `EloMatchService` both ran. The later `CombatEngine` port is not the rule where it disagrees: it drops max health, gives a speed tie to home, runs a 20th turn, and omits the Nezha part of the blow.

| Name | Kind | Definition | Rules | Do not say |
|---|---|---|---|---|
| `Fighter` | Input data | Stats frozen when a fight starts. The caller does not change this copy | Keeps max health and current health, and base attack and defense beside the current values. Traits that use lost health need both | `HeroLog`, `IMatchLog`, `Hero` |
| `Trait` | Concept | The innate of one hero name, applied before that fighter's blow | One formula per name below. A trait does not fire when the defender's effect resistance is set, or when the attacker's intrinsic status is `-1`. That skip also clears the defender's effect resistance | `Skill`, `SkillFactory` |
| `Turn` | Concept | One exchange. Both fighters can land a blow. The faster fighter blows first | A tie on speed goes to away. The loop runs while both are alive and the turn number is less than 20, so a fight ends on a knockout or when the turn number reaches 20 | |
| `blow` | Verb | One fighter strikes the other, after its trait | See the blow rule | `attack` as a second word |
| `CombatResult` | Output data | Winner, loser, turn log, turn count | Home wins only when home's remaining health is strictly greater. Equal health, including at the end, is a win for away | |

A `roll` is an integer from 0 through 100.

The blow, when the trait has already been applied:

1. The blow misses when `roll <= dodge`. A miss deals no health loss.
2. Otherwise damage is current attack minus current defense. A second roll crits when `roll <= crit rate`, and damage becomes `round(damage × crit damage / 100)`. Damage below 0 becomes 1. That damage is subtracted from the defender's current health.
3. If the attacker's name is Nezha and current health / max health is at most 0.8, the attacker heals `round(damage × 0.5)`. If the trait is active and that ratio is at most 0.5, the defender also loses `damage × 2`.

Traits:

| Name | Formula |
|---|---|
| Hell | If the attacker's health ratio is at most 0.7 and the attacker's current health is below the defender's, current attack increases by `round((defender current health − attacker current health) / 10)`. If the defender's health ratio is at most 0.3, the defender's current health becomes 0 |
| Sphinx | Current defense loses `round(30 + 10% of current defense when that defense is positive)`. Base defense loses `round(3% of current attack + 20% of base defense when that defense is positive)`. On an even turn, when the attacker's current health is below the defender's, current attack becomes `round(current attack × 1.2)` |
| Valkyrie | Intrinsic status increases by 1, capped at 4. The defender loses `round(0.02 × intrinsic status × defender max health)` |
| Hera | If the defender's intrinsic status is not 0 and the attacker's is 0, the attacker's intrinsic status becomes 1 and both the defender's current attack and base attack become `round(attack × 0.8)`. If the defender's intrinsic status is `-1` or a roll from 1 to 100 is greater than 30, current crit damage becomes `round(crit damage × 1.1)`. Otherwise current crit rate increases by 5 and effect resistance becomes 1 |
| Darklord | If the attacker's health ratio is at most 0.6, current attack becomes `round(attack × 1.6)`, current defense becomes `round(defense × 1.5)`, and intrinsic status becomes `-1` |
| Poseidon | While intrinsic status is below 10, it increases by 1, current attack becomes `round(attack × 1.075)`, and current defense becomes `round(defense × 1.02)` |
| Fenrir | Current crit rate increases by 5, current crit damage increases by 20, and intrinsic status increases by 1 |
| Chiron | Current attack becomes `round(base attack × (1 + (lost health / max health) × 0.85))` |
| Phoenix | The defender loses `round(attacker's lost health × 0.09)` |
| Amon | The attacker heals `round(current attack × 0.3)` and intrinsic status increases by 1. The defender's current defense loses `round(attacker's lost health × 0.006 + 20% of the defender's base defense when that defense is positive)` |
| Nezha | If the attacker's health ratio is at most 0.5 and a roll from 1 to 100 is at most 50, the trait is active. The health change is the Nezha step of the blow |

`Synthia` is a function in the old skill file and is not one of these eleven names. It is not a trait.

## Catalog

Reference data. Not a domain. Publishes stats. The caller freezes a `Fighter`.

| Name | Kind | Definition | Rules | Do not say |
|---|---|---|---|---|
| `Hero` | Reference data | A designed hero: name, base stats, trait name. This word means only this, and only inside the catalog | None | `HeroTemplate`, and do not use `Hero` for an owned hero or a fighter |

## House betting

Supporting domain. Owns the clock.

| Name | Kind | Definition | Rules | Do not say |
|---|---|---|---|---|
| `HouseMatch` | Concept | The one public fight accounts can stake on | One in play at a time. The two fighters are two distinct catalog heroes, chosen at random. Phases are `Open → Revealed → Settled`, and only forward. Created already `Open`. There is no `Scheduled` phase. The simulation already exists while the public view hides the winner and the log | `BettingMatch`, `Match`, `BetStatus`, `FIGHTING` |
| `Stake` | Concept | One account, one `HouseMatch`, one of the two catalog heroes in that match, one positive amount | One stake per account per match. Accepted only while `Open`. Payout is `amount × 2` and only when that catalog hero is the winner | `Bet`. The amount is not `balance` |
| `open` | Verb | Start the life of a `HouseMatch` at 0:00. Stakes are accepted. The result is hidden | | `openBetting` |
| `reveal` | Verb | At 2:00, close the window and publish the winner and the turn log | Does not simulate again | `closeBetting`, `FIGHTING` |
| `settle` | Verb | At 5:00, credit each winning stake and mark the match `Settled`. The next `HouseMatch` starts then | Credits and the settled mark commit together | `Reward` as a verb that also drops gems |

Events this context publishes:

| Event | When | Payload |
|---|---|---|
| `BettingOpened` | 0:00 | `matchId`, the two public fighters, `openedAt`. No winner. No log |
| `FightRevealed` | 2:00 | `matchId`, `winnerId`, the turn log, phase |
| `RewardsPaid` | 5:00, after credits commit | `matchId`, list of `{ accountId, stakeAmount, payout }` |
| `StakePlaced` | A stake has committed | `matchId`, `accountId`, catalog hero id, `amount`. Audit only |

## Roster

Supporting domain. Customer of Combat for a challenge. Listens to `RewardsPaid`. Does not place stakes.

| Name | Kind | Definition | Rules | Do not say |
|---|---|---|---|---|
| `OwnedHero` | Concept | The one hero an account owns: level, allocated points, computed stats, and an Elo number | `claim` copies one catalog hero onto the account and is refused when the account already has one. Level starts at 0. Elo starts at 1600. The sum of allocated points does not exceed level. Level-up debits `2^(currentLevel + 1)`, then level increases by exactly 1 | `UserHero`. Elo is a number on this concept, not a separate concept |
| `claim` | Verb | Take one catalog hero as the account's owned hero | Copies that hero's stats. Refused if the account already has an owned hero | |
| `Challenge` | Concept | A fight between two `OwnedHero`s that changes both Elo numbers | Calls `simulate` with the owned heroes' computed stats. Does not use `HouseMatch` phases or stakes. Home's outcome is 1 only when home's remaining health is strictly greater. Otherwise home's outcome is 0. New numbers come from `@studimax/elo` with `kFactor` 20 | `EloMatch` as a house match |
| `Gem` | Concept | A stone of one type and one level, counted in storage | Types are `HP`, `ATK`, `DEF`, `CRIT_RATE`, `CRIT_DMG`, `SPD`. A gem does not change stats. There is no attach rule | `grantGem` |
| `drop` | Verb | May add a level-1 gem after a winning stake is credited | A roll from 1 to 100 drops when it is at most 5. The type is uniform among the six. The count in storage increases by 1 | |
| `levelUpGem` | Verb | Spend stored gems of one type and level for a chance at one gem of the next level | Chance, as a percent, is `(spent / 10) × 100`. A roll from 1 to 100 succeeds when it is at most that chance. The spent gems are removed whether or not it succeeds | |
| `allocatePoints` | Verb | Set the point split on an `OwnedHero` | Rejected when the sum exceeds level. Then attack is `1000 × (1 + 0.01 × atk points)`, defense is `round(200 × (1 + 0.023 × def points))`, health is `10000 × (1 + 0.0138 × hp points)`, speed is `200 × (1 + 0.01 × spd points)`, and crit rate is `20 + round(0.25 × crit rate points)` | |
| `levelUp` | Verb | Pay the fee, then increase level by 1 | The fee is `2^(currentLevel + 1)` | The legacy write that persists `currentLevel + 2` |

## Ledger

Generic domain. Knows amounts. Does not know matches, days, or logins.

| Name | Kind | Definition | Rules | Do not say |
|---|---|---|---|---|
| `Balance` | Concept | The money of one `AccountId`. Column `accounts.balance` | Never negative. `debit` fails when the amount is greater than the balance. `credit` adds an amount | `Wallet` on the account |
| `debit` | Verb | Subtract an amount | One conditional update. Do not load the account row and write it back | |
| `credit` | Verb | Add an amount | Same write rule as `debit` | |

Payout `× 2`, the level-up fee, and the daily 100 are decided by the caller. The ledger receives the amount.

## Login grant

A supporting rule with no context of its own. It runs after a successful login.

On the first login of a calendar day in `Asia/Ho_Chi_Minh`, create a `Balance` at 0 when the account has none, then `credit(100)`. Later logins that day do not credit.

## Account and notification

Not domains.

| Name | Kind | Definition | Do not say |
|---|---|---|---|
| `Account` | Technical | Email, password, role, confirmation, address. Other contexts receive `AccountId` only | `User` when the meaning is this identity, or when the meaning is the balance |
| Notification | Technical | Emits `BettingOpened`, `FightRevealed`, and `RewardsPaid`. Does not open, reveal, or settle a match | A context that owns the clock |

## Physical names

| Table | Column | Word |
|---|---|---|
| `heroes` | | `Hero` |
| `accounts` | `balance` | `Account`, `Balance` |
| `addresses` | `account_id` | address on the account |
| `house_matches` | `phase` | `HouseMatch` phase: `Open`, `Revealed`, `Settled` |
| `stakes` | `amount`, `account_id`, `house_match_id` | `Stake` |
| `owned_heroes` | `account_id` | `OwnedHero` |
| `gems` | `account_id`, `available_num` | `Gem` |
| `elo-matches` | | `Challenge` |
