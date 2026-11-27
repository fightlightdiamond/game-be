import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bets')
export class BetOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  match_id: number;

  @Column()
  hero_id: number;

  @Column({ type: 'decimal', precision: 50, scale: 0, default: 0 })
  balance: number;

  @Column({ type: 'boolean', default: false })
  result: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
