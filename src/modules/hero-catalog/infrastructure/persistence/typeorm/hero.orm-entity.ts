import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('heroes')
export class HeroOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  acc: number;

  @Column({ default: 0 })
  atk: number;

  @Column({ default: 0 })
  atk_healing: number;

  @Column({ default: 0 })
  cc: number;

  @Column({ default: 0 })
  crit_dmg: number;

  @Column({ default: 0 })
  crit_rate: number;

  @Column({ default: 0 })
  def: number;

  @Column({ default: 0 })
  dodge: number;

  @Column({ default: 0 })
  effect_resistance: number;

  @Column({ default: 0 })
  intrinsic_status: number;

  @Column({ default: '' })
  element: string;

  @Column({ default: 0 })
  hp: number;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  position: string;

  @Column({ default: 0 })
  spd: number;

  @Column({ default: 0 })
  status: number;

  @Column({ default: 0 })
  take_dmg_healing: number;

  @Column({ type: 'text', nullable: true })
  skill: string | null;

  @Column({ type: 'text' })
  story: string;

  @Column({ type: 'text' })
  guide: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
