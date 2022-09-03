import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from './user.entity';

@ObjectType()
@Entity('tree')
export class TreeEntity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  public id: number;

  @Field()
  @Column({
    nullable: false,
  })
  public userId: number;

  @Field()
  @Column({ type: 'decimal', precision: 50, scale: 0, default: 0 })
  public startingValue: number;

  @Field()
  @CreateDateColumn({
    nullable: false,
  })
  public startTime: Date;

  @Field()
  @CreateDateColumn({
    nullable: true,
  })
  public endTime: Date;

  @Field()
  @Column()
  public status: number; // 0: growing, 1: robbed, 2: done

  @Field()
  @Column({
    nullable: true,
  })
  public bandit: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Relationship
   */
  @OneToOne(() => UserEntity, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'userId' })
  public user: UserEntity;

  @OneToOne(() => UserEntity, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'bandit' })
  public banditer: UserEntity;
}
