import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IHero, probability } from './interfaces/hero.interface';

@ObjectType()
@Entity('heroes')
export class HeroesEntity implements IHero {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  acc: number;

  @Field()
  @Column()
  atk: number;

  @Field()
  @Column()
  atk_healing: number;

  @Field()
  @Column()
  cc: number;

  @Field()
  @Column()
  crit_dmg: number;

  @Field()
  @Column()
  crit_rate: number;

  @Field()
  @Column()
  def: number;

  @Field()
  @Column()
  dodge: number;

  @Field()
  @Column()
  effect_resistance: string;

  @Field()
  @Column()
  element: string;

  @Field()
  @Column()
  hp: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  position: string;

  @Field()
  @Column()
  spd: number;

  @Field()
  @Column()
  status: string;

  @Field()
  @Column()
  take_dmg_healing: number;

  attack(targetHero: IHero, skill?): any {
    const ratio = probability();
    const log = {
      ratio,
      skill,
      crit: false,
      dame: 0,
    };

    if (ratio > this.crit_rate) {
      log.dame = this.atk - targetHero.def;
    } else {
      log.crit = true;
      console.log('Crit', this.name);
      log.dame = Math.floor((this.atk * this.crit_dmg) / 100) - targetHero.def;
    }

    targetHero.hp -= log.dame;

    return {
      i: this,
      you: targetHero,
      log,
    };
  }
}
