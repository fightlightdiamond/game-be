import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude, Expose } from 'class-transformer';
import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { UserInterface } from '../../app/user/user.interface';
import { RoleEnum } from '../../app/auth/role.enum';
import AddressEntity from './address.entity';

@ObjectType()
@Entity('users')
export class UserEntity extends BaseEntity implements UserInterface {
  @Field()
  @PrimaryGeneratedColumn({
    comment: 'The user unique identifier',
  })
  id: number;

  @Field()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  firstName: string;

  @Field()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  lastName: string;

  @ApiProperty({
    description: 'The address email',
    example: 'hero@bet-gamex.com',
  })
  @Field()
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @ApiProperty({})
  @Field()
  @Column({
    type: 'varchar',
  })
  @Exclude()
  password: string;

  @Field()
  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  phoneNumber: string;

  @Field()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  avatar: string;

  @Field()
  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.USER,
    nullable: true,
  })
  role: RoleEnum;

  @Field()
  @Column({ default: false })
  confirmed: boolean;

  @Field()
  @Column({ type: 'decimal', precision: 50, scale: 0, default: 0 })
  balance: number;

  @Field()
  @Column({ type: 'decimal', precision: 50, scale: 0, default: 0 })
  available_balance: number;

  @Field()
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Relationship
   */
  //Hash password before save
  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password || this.password, salt);
  }

  // Address
  // @Index()
  @OneToOne(() => AddressEntity, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  public address: AddressEntity;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
