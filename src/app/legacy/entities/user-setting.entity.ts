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
@Entity('user_settings')
export class UserSettingEntity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  user_id: number;

  @Field()
  @Column({
    type: 'varchar',
    nullable: false,
  })
  key: string;

  @Field()
  @Column({
    type: 'varchar',
    nullable: false,
  })
  value: string;

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
