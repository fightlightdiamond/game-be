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
@Entity('bets')
export class BetEntity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  user_id: number;

  @Field()
  @Column()
  match_id: number;

  @Field()
  @Column()
  hero_id: number;

  @Field()
  @Column({ type: 'decimal', precision: 50, scale: 0, default: 0 })
  balance: number;

  @Field()
  @Column({
    type: 'boolean',
    default: false,
  })
  result: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
