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
@Entity('user_gems')
export class UserGemEntity extends BaseEntity {
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
  type: string;

  @Field()
  @Column()
  level: number;

  @Field()
  @Column({
    default: 0,
  })
  available_num: number;

  @Field()
  @Column({
    default: 0,
  })
  attached_num: number;

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
