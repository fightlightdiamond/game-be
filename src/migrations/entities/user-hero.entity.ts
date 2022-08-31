import { Field, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
