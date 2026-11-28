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
@Entity('auto_settings')
export class UserSettingEntity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  user_id: number;

  @Field()
  @Column({
    type: 'json',
    nullable: true,
  })
  match_info: string;

  @Field()
  @Column({
    type: 'json',
    nullable: true,
  })
  hero_id: string;

  @Field()
  @Column({
    type: 'boolean',
    nullable: false,
  })
  enable: boolean;

  @Field()
  @Column()
  percent_balance: number;

  @Field()
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
