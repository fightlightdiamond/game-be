import { AggregateRoot } from '@nestjs/cqrs';
import { EloRating } from '../value-objects/elo-rating.vo';
import { ExceedsLevelCapException } from '../exceptions/exceeds-level-cap.exception';
import { EloUpdatedEvent } from '../events/elo-updated.event';

export class UserHero extends AggregateRoot {
  private _eloRating: EloRating;
  private _level: number;
  private _atkPoint: number;
  private _defPoint: number;
  private _hpPoint: number;
  private _spdPoint: number;
  private _critRatePoint: number;

  // Computed combat stats
  private _atk: number;
  private _def: number;
  private _hp: number;
  private _spd: number;
  private _critRate: number;

  constructor(
    private readonly _id: number,
    private readonly _userId: number,
    private readonly _heroId: number,
    level: number,
    atkPoint: number,
    defPoint: number,
    hpPoint: number,
    spdPoint: number,
    critRatePoint: number,
    eloRating: EloRating,
    atk: number,
    def: number,
    hp: number,
    spd: number,
    critRate: number,
  ) {
    super();
    this._level = level;
    this._atkPoint = atkPoint;
    this._defPoint = defPoint;
    this._hpPoint = hpPoint;
    this._spdPoint = spdPoint;
    this._critRatePoint = critRatePoint;
    this._eloRating = eloRating;
    this._atk = atk;
    this._def = def;
    this._hp = hp;
    this._spd = spd;
    this._critRate = critRate;
  }

  // Getters
  get id() {
    return this._id;
  }

  get userId() {
    return this._userId;
  }

  get heroId() {
    return this._heroId;
  }

  get level() {
    return this._level;
  }

  get atkPoint() {
    return this._atkPoint;
  }

  get defPoint() {
    return this._defPoint;
  }

  get hpPoint() {
    return this._hpPoint;
  }

  get spdPoint() {
    return this._spdPoint;
  }

  get critRatePoint() {
    return this._critRatePoint;
  }

  get eloRating() {
    return this._eloRating;
  }

  get atk() {
    return this._atk;
  }

  get def() {
    return this._def;
  }

  get hp() {
    return this._hp;
  }

  get spd() {
    return this._spd;
  }

  get critRate() {
    return this._critRate;
  }

  levelUp(): void {
    this._level += 1;
  }

  allocatePoints(
    atk: number,
    def: number,
    hp: number,
    spd: number,
    critRate: number,
  ): void {
    const total = atk + def + hp + spd + critRate;
    if (atk < 0 || def < 0 || hp < 0 || spd < 0 || critRate < 0) {
      throw new Error('Skill points cannot be negative');
    }
    if (total > this._level) {
      throw new ExceedsLevelCapException(total, this._level);
    }
    this._atkPoint = atk;
    this._defPoint = def;
    this._hpPoint = hp;
    this._spdPoint = spd;
    this._critRatePoint = critRate;

    // Recompute stats using the same formulas from the existing UserHeroService
    this._atk = 1000 * (1 + 0.01 * atk);
    this._def = Math.round(200 * (1 + 0.023 * def));
    this._hp = 10000 * (1 + 0.0138 * hp);
    this._spd = 200 * (1 + 0.01 * spd);
    this._critRate = 20 + Math.round(0.25 * critRate);
  }

  applyEloResult(newRating: EloRating): void {
    this._eloRating = newRating;
    this.apply(new EloUpdatedEvent(this._id, newRating.getValue()));
  }

  static create(
    userId: number,
    heroId: number,
    baseAtk: number,
    baseDef: number,
    baseHp: number,
    baseSpd: number,
    baseCritRate: number,
  ): UserHero {
    return new UserHero(
      0,
      userId,
      heroId,
      1, // initial level
      0,
      0,
      0,
      0,
      0, // initial skill points
      EloRating.initial(),
      baseAtk,
      baseDef,
      baseHp,
      baseSpd,
      baseCritRate,
    );
  }
}
