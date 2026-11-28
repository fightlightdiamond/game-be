import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field } from '@nestjs/graphql';
import { UserEntity } from './user.entity';

@Entity('addresses')
class AddressEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public street: string;

  @Column()
  public city: string;

  @Column()
  public country: string;

  //User
  @OneToOne(() => UserEntity, (user: UserEntity) => user.address)
  @JoinColumn()
  public user: UserEntity;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default AddressEntity;
