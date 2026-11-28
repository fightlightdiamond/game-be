import { BettingOpened } from './events/betting-opened.event';
import { FightRevealed } from './events/fight-revealed.event';
import { RewardsPaid } from './events/rewards-paid.event';
import { StakeRefusedException } from './exceptions/stake-refused.exception';
import { HouseFighter } from './house-fighter';
import { Phase } from './phase';
import { Stake } from './stake';
import { winningPayouts } from './winning-payouts';

export type StoredResult = {
  winnerId: number;
  loserId: number;
  turns: readonly object[];
  turnNumber: number;
};

export class HouseMatch {
  private constructor(
    readonly id: number,
    private phase: Phase,
    readonly fighters: HouseFighter[],
    private readonly stored: StoredResult,
    readonly openedAt: string,
  ) {}

  static open(
    fighters: HouseFighter[],
    stored: StoredResult,
    openedAt: string,
  ): HouseMatch {
    return new HouseMatch(0, Phase.Open, fighters, stored, openedAt);
  }

  static reconstitute(
    id: number,
    phase: Phase,
    fighters: HouseFighter[],
    stored: StoredResult,
    openedAt: string,
  ): HouseMatch {
    return new HouseMatch(id, phase, fighters, stored, openedAt);
  }

  get currentPhase(): Phase {
    return this.phase;
  }

  get storedWinnerId(): number {
    return this.stored.winnerId;
  }

  get storedLoserId(): number {
    return this.stored.loserId;
  }

  get storedTurns(): readonly object[] {
    return this.stored.turns;
  }

  get storedTurnNumber(): number {
    return this.stored.turnNumber;
  }

  withId(id: number): HouseMatch {
    return new HouseMatch(
      id,
      this.phase,
      this.fighters,
      this.stored,
      this.openedAt,
    );
  }

  bettingOpened(): BettingOpened {
    return new BettingOpened(this.id, this.fighters, this.openedAt);
  }

  toPublic(): {
    id: number;
    phase: Phase;
    fighters: HouseFighter[];
    openedAt: string;
    winnerId: number;
    loserId: number;
    turns: readonly object[];
    turnNumber: number;
  } {
    const hidden = this.phase === Phase.Open;
    return {
      id: this.id,
      phase: this.phase,
      fighters: this.fighters,
      openedAt: this.openedAt,
      winnerId: hidden ? 0 : this.stored.winnerId,
      loserId: hidden ? 0 : this.stored.loserId,
      turns: hidden ? [] : this.stored.turns,
      turnNumber: hidden ? 0 : this.stored.turnNumber,
    };
  }

  placeStake(accountId: number, heroId: number, amount: number): Stake {
    if (this.phase !== Phase.Open) {
      throw new StakeRefusedException('A stake is accepted only while Open');
    }
    if (amount <= 0) {
      throw new StakeRefusedException('A stake amount is greater than 0');
    }
    const onTheCard = this.fighters.some((fighter) => fighter.id === heroId);
    if (!onTheCard) {
      throw new StakeRefusedException(
        'A stake is on one of the two catalog heroes',
      );
    }
    return new Stake(0, accountId, this.id, heroId, amount);
  }

  reveal(): FightRevealed {
    if (this.phase !== Phase.Open) {
      throw new Error('A house match reveals from Open');
    }
    this.phase = Phase.Revealed;
    return new FightRevealed(
      this.id,
      this.stored.winnerId,
      this.stored.turns,
      this.phase,
    );
  }

  settle(stakes: Stake[]): RewardsPaid | null {
    if (this.phase === Phase.Settled) {
      return null;
    }
    if (this.phase !== Phase.Revealed) {
      throw new Error('A house match settles from Revealed');
    }
    this.phase = Phase.Settled;
    return new RewardsPaid(
      this.id,
      winningPayouts(stakes, this.stored.winnerId),
    );
  }
}
