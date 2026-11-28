import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('elo-matches')
export class ChallengeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json', nullable: true })
  hero_info: string;

  @Column({ type: 'json', nullable: true })
  turns: string;

  @Column({ type: 'varchar', nullable: true })
  start_time: string;

  @Column({ default: 0 })
  turn_number: number;

  @Column({ default: 0 })
  status: number;

  @Column({ default: 0 })
  winner: number;

  @Column({ default: 0 })
  loser: number;

  @Column({ default: 0 })
  type: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
