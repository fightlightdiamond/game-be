import { Field, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MatchInterface } from '../interfaces/match.interface';

@ObjectType()
@Entity('matches')
export class MatchEntity extends BaseEntity implements MatchInterface {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({
    type: 'json',
    nullable: true,
  })
  hero_info: string;

  @Field()
  @Column({
    type: 'json',
    nullable: true,
  })
  turns: string;

  @Field()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  start_time: string;

  @Field()
  @Column({
    default: 0,
  })
  turn_number: number;

  @Field()
  @Column({
    default: 0,
  })
  status: number;

  @Field()
  @Column({
    default: 0,
  })
  winner: number;

  @Field()
  @Column({
    default: 0,
  })
  loser: number;

  @Field()
  @Column({
    default: 0,
  })
  type: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
