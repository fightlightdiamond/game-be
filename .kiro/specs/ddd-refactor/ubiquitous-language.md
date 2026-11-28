# Ubiquitous Language — bet-herox

This is the language of the game. A domain expert, this set of documents, and a new domain class or method use the same word for the same idea.

Eric Evans, *Domain-Driven Design* (2003), defines the ubiquitous language as the shared language of the domain model. It is spoken in conversation and written into class names, method names, and documents. A translation layer between "what the business says" and "what the code says" is a defect in the model.

The language is per context. The same English word may be refused in a second context. `Hero` means a catalog hero only. It is not the word for an owned hero, and it is not the word for a fighter.

## How the documents divide the work

| File | What it decides |
|---|---|
| [domain-theory.md](./domain-theory.md) | What "business", "domain", "rule", and "data" mean |
| [strategic-design.md](./strategic-design.md) | Which slice is which context, and how contexts relate |
| [concepts.md](./concepts.md) | Whether a named thing is a concept, data, or a rule, and the sentence of that rule |
| This file | The word that is spoken, written, and used as a class or method name |

If two files spell a game word differently, change the other file. This file wins on the word. It does not invent a rule. Words that are out of the product are listed at the end.

A column uses the same word. `accounts.balance` is the Balance. `stakes.amount` is the stake. `house_matches.phase` is `Open`, `Revealed`, or `Settled`.

## How to name code

- A noun in a table below is the class name, or the name of a field that holds that idea.
- A verb in a table below is the method name. Do not implement that action as `update`, `setStatus`, `delete`, or `save` with a status argument.
- An event name is past tense. It states a fact that has already committed.
- Do not prefix a domain type with `User`, `Bet`, or `Match` to make it unique. Use the word in the table.

## Sentences we can say

These sentences are the language in use. A class model that cannot be read back as these sentences has the wrong names.

**House match.** The house opens a match between two distinct catalog heroes. The result already exists and is hidden. An account places one stake on one of those two heroes. Two minutes later the fight is revealed: the winner and the turn log are public. At five minutes the house settles, and each winning stake is credited `amount × 2`. The next house match starts then.

**Combat.** A caller freezes two fighters and asks combat to simulate. The faster fighter blows first. A tie on speed goes to away. Each fighter's trait applies before its blow. The fight stops on a knockout or when the turn number reaches 20. Home wins only when home's remaining health is strictly greater.

**Roster.** An account claims one catalog hero. It allocates points up to that hero's level, and it levels that hero up by paying the fee. It challenges another account's owned hero. Both Elo numbers change. A gem may drop after a winning stake is paid. The account may spend stored gems to level a gem up. A gem does not change stats.

**Money.** The ledger debits or credits the balance of an account id. It does not know why. The first login of the day in `Asia/Ho_Chi_Minh` credits 100 once.

## Combat

| Word | Kind | Say this | Do not say |
|---|---|---|---|
| `Fighter` | Noun | The stats frozen when a fight starts. The caller does not change this copy | `Hero`, `HeroLog`, `IMatchLog`, `HeroSnapshot` |
| `home` | Role | The first fighter passed to `simulate`. Wins only when its remaining health is strictly greater | `player1`, `left` |
| `away` | Role | The second fighter passed to `simulate`. Acts first on a speed tie. Wins when remaining health is equal | `player2`, `right` |
| `Trait` | Noun | The innate of one hero name, applied before that fighter's blow. The eleven names and formulas are in [concepts.md](./concepts.md) | `Skill`, `SkillFactory`, `SkillService` |
| `Turn` | Noun | One exchange. The faster fighter blows first. The loop stops when the turn number reaches 20 | `Round` as a second concept |
| `blow` | Verb | One strike after the trait. A miss, then damage, then the Nezha step | `attack` as a second word |
| `CombatResult` | Noun | Winner, loser, turn log, and turn count | A match, a stake |
| `simulate` | Verb | `simulate(home, away)` returns a `CombatResult` | `fight`, `play`, `runRound` |

## Catalog

| Word | Kind | Say this | Do not say |
|---|---|---|---|
| `Hero` | Noun | A designed hero: name, base stats, trait name. Only this meaning, and only in the catalog | `HeroTemplate`. Do not call an owned hero or a fighter a `Hero` |
| `PublishedHero` | Noun | The stats the catalog publishes to house betting and roster. Callers freeze a `Fighter` from it, or copy them on `claim` | The catalog `Hero` class outside the catalog |

## House betting

| Word | Kind | Say this | Do not say |
|---|---|---|---|
| `HouseMatch` | Noun | The one public fight accounts can stake on. One is in play at a time | `Match`, `BettingMatch` |
| `Open` | Phase | From 0:00. Stakes are accepted. The winner and the log are hidden | `Betting`, `PENDING`, `Scheduled` |
| `Revealed` | Phase | From 2:00. The winner and the turn log are public. No new stake | `FIGHTING`. The fight is not still being calculated |
| `Settled` | Phase | From 5:00. Winning stakes have been credited. The next house match may start | `END` |
| `Stake` | Noun | One account, one house match, one of the two catalog heroes in that match, one positive amount | `Bet` |
| `amount` | Field | The money of a stake | `balance` |
| `placeStake` | Verb | Accept a stake while the match is `Open` | `bet`, `createBet` |
| `open` | Verb | Start the life of a house match at 0:00. The result already exists and is not public | `openBetting`, `startMatch` as a phase name |
| `reveal` | Verb | At 2:00, close the window and publish the winner and the turn log. Do not simulate again | `closeBetting`, `resolveFighting` |
| `settle` | Verb | At 5:00, credit each winning stake `amount × 2` and mark the match `Settled` | `reward`, `resolveReward` |

There is no `Scheduled` phase. A house match is created already `Open`. Closing the window and revealing the fight are the same verb, `reveal`.

`settle` credits money. It does not drop a gem. The gem is a later reaction to `RewardsPaid`.

### Events

An event is a fact in the past tense. Notification may emit it. Notification does not open, reveal, or settle.

| Word | Say this |
|---|---|
| `BettingOpened` | The window has just opened. Payload: match id, the two public fighters, when it opened. No winner. No log |
| `FightRevealed` | The window has closed and the fight is public. Payload: match id, winner id, the turn log, phase |
| `RewardsPaid` | Credits and the settled mark have committed. Payload: match id, and for each winning stake the account id, the stake amount, and the payout |
| `StakePlaced` | A stake has committed. Payload: match id, account id, catalog hero id, amount. Audit only |

## Roster

| Word | Kind | Say this | Do not say |
|---|---|---|---|
| `OwnedHero` | Noun | The one hero an account owns: level, allocated points, computed stats, and an Elo number starting at 1600 | `UserHero`, `Hero` |
| `claim` | Verb | Copy one catalog hero onto the account. Refused when the account already has an owned hero | |
| `allocatePoints` | Verb | Set the point split. Refused when the sum exceeds level. The five formulas are in [concepts.md](./concepts.md) | `updateStats` |
| `levelUp` | Verb | Pay `2^(currentLevel + 1)`, then increase level by exactly 1 | A write that increases level by 2 |
| `Challenge` | Noun | A fight between two owned heroes that changes both Elo numbers | `EloMatch` when the meaning is a house match. `HouseMatch` |
| `challenge` | Verb | Simulate the two owned heroes, then set both Elo numbers with `kFactor` 20 | `bet` |
| `Gem` | Noun | A stone of type `HP`, `ATK`, `DEF`, `CRIT_RATE`, `CRIT_DMG`, or `SPD`, with a level and a count in storage | A modifier of a fighter's stats |
| `drop` | Verb | After a winning stake is credited, a roll from 1 to 100 adds a level-1 gem when the roll is at most 5 | `grantGem`. Do not call this `settle` |
| `levelUpGem` | Verb | Spend stored gems of one type and level for a chance at the next level | `attach` |

## Ledger

| Word | Kind | Say this | Do not say |
|---|---|---|---|
| `Balance` | Noun | The money of one `AccountId`. Never negative. Column `accounts.balance` | `Wallet` on the account |
| `debit` | Verb | Subtract an amount. Fails when the amount is greater than the balance | `deduct` as a second word. Do not load the account and write it back |
| `credit` | Verb | Add an amount | `reward` |

The ledger does not know a match, a day, or a login. The caller decides the amount: `amount × 2`, the level-up fee, or 100.

## Login grant

`login grant` is the name of the rule. It is not a context and not a class of its own.

Say: on the first login of a calendar day in `Asia/Ho_Chi_Minh`, create a `Balance` at 0 when the account has none, then `credit(100)`. A later login that day does not credit.

Do not say that the ledger "knows the daily bonus", and do not say that registration opens the balance.

## Account and notification

| Word | Kind | Say this | Do not say |
|---|---|---|---|
| `Account` | Noun | Email, password, role, confirmation, address | `User` for this identity. `User` for the balance |
| `AccountId` | Noun | The identifier other contexts store. Not an event | A `User` aggregate passed across a context |
| Notification | Noun | Emits `BettingOpened`, `FightRevealed`, and `RewardsPaid` | The owner of the match clock |

## Words that already mean two things

When the current code uses the word on the left, the language uses the words on the right.

| Current word | Split into |
|---|---|
| `Hero` | `Hero` in the catalog, `OwnedHero` in roster, `Fighter` in combat |
| `Match` | `HouseMatch` or `Challenge` |
| `balance` | `Balance` on the ledger, `amount` on a stake |
| `User` | `Account`, plus a `Balance` keyed by `AccountId` |
| `Reward` | `settle`, then the event `RewardsPaid`, then `drop` |
| `BetStatus` | `Open`, `Revealed`, `Settled` |

## Not words in this product

Do not add a class for these. The sentences that were considered, and the reason they are out, are in [concepts.md](./concepts.md).

- `attach` as a gem action
- `Synthia` as a trait
