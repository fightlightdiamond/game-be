import { Hero } from '../../hero-catalog/domain/hero';
import { ExceedsLevelCapException } from './exceptions/exceeds-level-cap.exception';
import { SecondClaimRefusedException } from './exceptions/second-claim-refused.exception';

const STARTING_ELO = 1600;

export class OwnedHero {
  private constructor(
    readonly id: number,
    readonly accountId: number,
    readonly heroId: number,
    private levelValue: number,
    private atkPointValue: number,
    private defPointValue: number,
    private hpPointValue: number,
    private spdPointValue: number,
    private critRatePointValue: number,
    private eloValue: number,
    private atkValue: number,
    private defValue: number,
    private hpValue: number,
    private spdValue: number,
    private critRateValue: number,
  ) {}

  static claim(
    accountId: number,
    hero: Hero,
    existing: OwnedHero | null,
  ): OwnedHero {
    if (existing) {
      throw new SecondClaimRefusedException(accountId);
    }
    return new OwnedHero(
      0,
      accountId,
      hero.id,
      0,
      0,
      0,
      0,
      0,
      0,
      STARTING_ELO,
      hero.stats.atk,
      hero.stats.def,
      hero.stats.hp,
      hero.stats.spd,
      hero.stats.critRate,
    );
  }

  static reconstitute(
    id: number,
    accountId: number,
    heroId: number,
    level: number,
    atkPoint: number,
    defPoint: number,
    hpPoint: number,
    spdPoint: number,
    critRatePoint: number,
    elo: number,
    atk: number,
    def: number,
    hp: number,
    spd: number,
    critRate: number,
  ): OwnedHero {
    return new OwnedHero(
      id,
      accountId,
      heroId,
      level,
      atkPoint,
      defPoint,
      hpPoint,
      spdPoint,
      critRatePoint,
      elo,
      atk,
      def,
      hp,
      spd,
      critRate,
    );
  }

  withId(id: number): OwnedHero {
    return OwnedHero.reconstitute(
      id,
      this.accountId,
      this.heroId,
      this.levelValue,
      this.atkPointValue,
      this.defPointValue,
      this.hpPointValue,
      this.spdPointValue,
      this.critRatePointValue,
      this.eloValue,
      this.atkValue,
      this.defValue,
      this.hpValue,
      this.spdValue,
      this.critRateValue,
    );
  }

  get userId(): number {
    return this.accountId;
  }

  get level(): number {
    return this.levelValue;
  }

  get atkPoint(): number {
    return this.atkPointValue;
  }

  get defPoint(): number {
    return this.defPointValue;
  }

  get hpPoint(): number {
    return this.hpPointValue;
  }

  get spdPoint(): number {
    return this.spdPointValue;
  }

  get critRatePoint(): number {
    return this.critRatePointValue;
  }

  get elo(): number {
    return this.eloValue;
  }

  get atk(): number {
    return this.atkValue;
  }

  get def(): number {
    return this.defValue;
  }

  get hp(): number {
    return this.hpValue;
  }

  get spd(): number {
    return this.spdValue;
  }

  get critRate(): number {
    return this.critRateValue;
  }

  levelUp(): void {
    this.levelValue += 1;
  }

  setElo(value: number): void {
    this.eloValue = value;
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
    if (total > this.levelValue) {
      throw new ExceedsLevelCapException(total, this.levelValue);
    }
    this.atkPointValue = atk;
    this.defPointValue = def;
    this.hpPointValue = hp;
    this.spdPointValue = spd;
    this.critRatePointValue = critRate;
    this.atkValue = 1000 * (1 + 0.01 * atk);
    this.defValue = Math.round(200 * (1 + 0.023 * def));
    this.hpValue = 10000 * (1 + 0.0138 * hp);
    this.spdValue = 200 * (1 + 0.01 * spd);
    this.critRateValue = 20 + Math.round(0.25 * critRate);
  }
}
