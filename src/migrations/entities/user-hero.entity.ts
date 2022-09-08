import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { HeroEntity } from './hero.entity';

@ObjectType()
@Entity('user_heroes')
export class UserHeroEntity extends HeroEntity {
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
    default: 1600,
  })
  elo: number;
}
