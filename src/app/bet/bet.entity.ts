import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  win_id: number;

  @Field()
  @Column()
  balance: number;

  @Field()
  @Column()
  result: number;
}
