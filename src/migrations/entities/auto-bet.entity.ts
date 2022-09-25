import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('auto-bets')
export class AutoBetEntity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn({
    comment: 'The auto bet unique identifier',
  })
  id: number;

  @Index()
  @Field()
  @Column({
    type: 'integer',
  })
  user_id: number;

  @Index()
  @Field()
  @Column({
    type: 'varchar',
  })
  rival_pair: string;

  @Index()
  @Field()
  @Column({
    type: 'integer',
    nullable: true,
  })
  hero_id: number;

  @Index()
  @Field()
  @Column({
    type: 'boolean',
    default: false,
  })
  is_enable: boolean;

  @Field()
  @Column({
    type: 'integer',
    default: 1,
  })
  bet_percentage: number;
}
