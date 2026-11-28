import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('owned_heroes')
export class OwnedHeroOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_id: number;

  @Column()
  hero_id: number;

  @Column({ default: 0 })
  level: number;

  @Column({ default: 0 })
  atk_point: number;

  @Column({ default: 0 })
  def_point: number;

  @Column({ default: 0 })
  hp_point: number;

  @Column({ default: 0 })
  spd_point: number;

  @Column({ default: 0 })
  crit_rate_point: number;

  @Column({ default: 1600 })
  elo: number;

  @Column({ default: 0 })
  atk: number;

  @Column({ default: 0 })
  def: number;

  @Column({ default: 0 })
  hp: number;

  @Column({ default: 0 })
  spd: number;

  @Column({ default: 0 })
  crit_rate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
