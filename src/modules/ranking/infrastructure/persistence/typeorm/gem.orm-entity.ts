import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('gems')
export class GemOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_id: number;

  @Column({ type: 'varchar' })
  type: string;

  @Column()
  level: number;

  @Column({ default: 0 })
  available_num: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
