import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IHero } from './interfaces/hero.interface';

@ObjectType()
@Entity('heroes')
export class HeroEntity extends BaseEntity implements IHero {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({
    default: 0,
  })
  acc: number;

  @Field()
  @Column({
    default: 0,
  })
  current_acc: number;

  @Field()
  @Column({
    default: 0,
  })
  atk: number;

  @Field()
  @Column({
    default: 0,
  })
  current_atk: number;

  @Field()
  @Column({
    default: 0,
  })
  atk_healing: number;

  @Field()
  @Column({
    default: 0,
  })
  current_atk_healing: number;

  @Field()
  @Column({
    default: 0,
  })
  cc: number;

  @Field()
  @Column({
    default: 0,
  })
  current_cc: number;

  @Field()
  @Column({
    default: 0,
  })
  crit_dmg: number;

  @Field()
  @Column({
    default: 0,
  })
  current_crit_dmg: number;

  @Field()
  @Column({
    default: 0,
  })
  crit_rate: number;

  @Field()
  @Column({
    default: 0,
  })
  current_crit_rate: number;

  @Field()
  @Column({
    default: 0,
  })
  def: number;

  @Field()
  @Column({
    default: 0,
  })
  current_def: number;

  @Field()
  @Column({
    default: 0,
  })
  dodge: number;

  @Field()
  @Column({
    default: 0,
  })
  current_dodge: number;

  @Field()
  @Column({
    default: 0,
  })
  effect_resistance: number;

  @Field()
  @Column({
    default: 0,
  })
  intrinsic_status: number;

  @Field()
  @Column({
    default: '',
  })
  element: string;

  @Field()
  @Column({
    default: 0,
  })
  hp: number;

  @Field()
  @Column({
    default: 0,
  })
  current_hp: number;

  @Field()
  @Column({
    default: '',
  })
  name: string;

  @Field()
  @Column({
    default: '',
  })
  position: string;

  @Field()
  @Column({
    default: 0,
  })
  spd: number;

  @Field()
  @Column({
    default: 0,
  })
  current_spd: number;

  @Field()
  @Column({
    default: 0,
  })
  status: number;

  @Field()
  @Column({
    default: 0,
  })
  take_dmg_healing: number;

  @Field()
  @Column({
    default: 0,
  })
  current_take_dmg_healing: number;

  @Field()
  @Column({
    type: 'text',
  })
  story: string;

  @Field()
  @Column({
    type: 'text',
  })
  guide: string;
}
