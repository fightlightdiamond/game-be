import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('stakes')
@Unique('one_stake_per_account', ['account_id', 'house_match_id'])
export class StakeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_id: number;

  @Column()
  house_match_id: number;

  @Column()
  hero_id: number;

  @Column({ type: 'decimal', precision: 50, scale: 0, default: 0 })
  amount: number;

  @Column({ type: 'boolean', default: false })
  result: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
