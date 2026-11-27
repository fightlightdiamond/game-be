import { AggregateRoot } from '@nestjs/cqrs';
import { MatchStatus } from '../value-objects/match-status.vo';
import { InvalidMatchTransitionException } from '../exceptions/invalid-match-transition.exception';
import { BettingClosedException } from '../exceptions/betting-closed.exception';
import { MatchCreatedEvent } from '../events/match-created.event';
import { FightingStartedEvent } from '../events/fighting-started.event';
import { MatchEndedEvent } from '../events/match-ended.event';
import { BetPlacedEvent } from '../events/bet-placed.event';
import { Bet } from '../entities/bet.entity';

export class BettingMatch extends AggregateRoot {
  private _status: MatchStatus;
  private _bets: Bet[];
  private _heroInfo: Array<Record<string, unknown>>;
  private _combatWinnerId: number;
  private _combatLoserId: number;
  private _combatTurns: Array<Record<string, unknown>>;
  private _combatTurnNumber: number;
  private _startTime: string;

  // Public getters
  get id(): number {
    return this._id;
  }

  get status(): MatchStatus {
    return this._status;
  }

  get bets(): Bet[] {
    return [...this._bets];
  }

  get heroInfo(): Array<Record<string, unknown>> {
    return this._heroInfo;
  }

  get startTime(): string {
    return this._startTime;
  }

  get winner(): number {
    // Hide winner until match is FIGHTING or END
    return this._status >= MatchStatus.FIGHTING ? this._combatWinnerId : 0;
  }

  get loser(): number {
    return this._status >= MatchStatus.FIGHTING ? this._combatLoserId : 0;
  }

  get turns(): Array<Record<string, unknown>> {
    return this._status >= MatchStatus.FIGHTING ? this._combatTurns : [];
  }

  get turnNumber(): number {
    return this._combatTurnNumber;
  }

  constructor(private readonly _id: number) {
    super();
    this._status = MatchStatus.PENDING;
    this._bets = [];
    this._heroInfo = [];
    this._combatWinnerId = 0;
    this._combatLoserId = 0;
    this._combatTurns = [];
    this._combatTurnNumber = 0;
    this._startTime = '';
  }

  static create(
    id: number,
    heroInfo: Array<Record<string, unknown>>,
    combatWinnerId: number,
    combatLoserId: number,
    combatTurns: Array<Record<string, unknown>>,
    combatTurnNumber: number,
  ): BettingMatch {
    const match = new BettingMatch(id);
    match._heroInfo = heroInfo;
    match._combatWinnerId = combatWinnerId;
    match._combatLoserId = combatLoserId;
    match._combatTurns = combatTurns;
    match._combatTurnNumber = combatTurnNumber;
    match._startTime = Date.now().toString();
    return match;
  }

  startBetting(): void {
    if (this._status !== MatchStatus.PENDING) {
      throw new InvalidMatchTransitionException(
        this._status,
        MatchStatus.BETTING,
      );
    }
    this._status = MatchStatus.BETTING;
    this.apply(
      new MatchCreatedEvent(
        this._id,
        this._heroInfo,
        this._startTime,
        this._status,
      ),
    );
  }

  startFighting(): void {
    if (this._status !== MatchStatus.BETTING) {
      throw new InvalidMatchTransitionException(
        this._status,
        MatchStatus.FIGHTING,
      );
    }
    this._status = MatchStatus.FIGHTING;
    this.apply(new FightingStartedEvent(this._id, this._status));
  }

  endMatch(winnerBets: Array<{ userId: number; payout: number }>): void {
    if (this._status !== MatchStatus.FIGHTING) {
      throw new InvalidMatchTransitionException(this._status, MatchStatus.END);
    }
    this._status = MatchStatus.END;
    this.apply(new MatchEndedEvent(this._id, winnerBets));
  }

  placeBet(userId: number, heroId: number, amount: number): Bet {
    if (this._status !== MatchStatus.BETTING) {
      throw new BettingClosedException();
    }
    const alreadyBet = this._bets.some((b) => b.userId === userId);
    if (alreadyBet) {
      throw new Error(`User ${userId} already placed a bet on this match`);
    }
    const bet = new Bet(0, userId, this._id, heroId, amount);
    this._bets.push(bet);
    this.apply(new BetPlacedEvent(this._id, userId, heroId, amount));
    return bet;
  }

  // Reconstruction from persistence (no events applied)
  static reconstitute(
    id: number,
    status: MatchStatus,
    heroInfo: Array<Record<string, unknown>>,
    combatWinnerId: number,
    combatLoserId: number,
    combatTurns: Array<Record<string, unknown>>,
    combatTurnNumber: number,
    startTime: string,
    bets: Bet[],
  ): BettingMatch {
    const match = new BettingMatch(id);
    match._status = status;
    match._heroInfo = heroInfo;
    match._combatWinnerId = combatWinnerId;
    match._combatLoserId = combatLoserId;
    match._combatTurns = combatTurns;
    match._combatTurnNumber = combatTurnNumber;
    match._startTime = startTime;
    match._bets = bets;
    return match;
  }
}
