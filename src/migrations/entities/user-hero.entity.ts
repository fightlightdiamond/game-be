import { Field, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { HeroEntity } from './hero.entity';

@ObjectType()
@Entity('user_heroes')
export class UserHeroEntity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  user_id: number;

  @Field()
  @Column()
  hero_id: number;

  @Field()
  @Column({
    default: 0,
  })
  level: number;

  @Field()
  @Column({
    default: 0,
  })
  atk_point: number;

  @Field()
  @Column({
    default: 0,
  })
  def_point: number;

  @Field()
  @Column({
    default: 0,
  })
  hp_point: number;

  @Field()
  @Column({
    default: 0,
  })
  spd_point: number;

  @Field()
  @Column({
    default: 0,
  })
  crit_rate_point: number;

  @Field()
  @Column({
    default: 1600,
  })
  elo: number;

  @Field()
  @Column({
    default: 0,
  })
  acc: number;

  @Field()
  @Column({
    default: 0,
  })
  atk: number;

  @Field()
  @Column({
    default: 0,
  })
  atk_healing: number;

  @Field()
  @Column({
    default: 0,
  })
  cc: number;

  @Field()
  @Column({
    default: 0,
  })
  crit_dmg: number;

  @Field()
  @Column({
    default: 0,
  })
  crit_rate: number;

  @Field()
  @Column({
    default: 0,
  })
  def: number;

  @Field()
  @Column({
    default: 0,
  })
  dodge: number;

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
  status: number;

  @Field()
  @Column({
    default: 0,
  })
  take_dmg_healing: number;

  @Field()
  @Column({
    type: 'text',
    nullable: true,
  })
  skill: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => HeroEntity)
  @JoinColumn({ name: 'hero_id' })
  hero: HeroEntity;
}
