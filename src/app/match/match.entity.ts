import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('matches')
export class MatchEntity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  atk_id: number;

  @Field()
  @Column()
  def_id: number;

  @Field()
  @Column()
  win_id: number;

  @Field()
  @Column()
  type: number;

  @Field()
  @Column('json')
  content: string;
}
