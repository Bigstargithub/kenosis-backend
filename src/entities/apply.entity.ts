import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('apply')
export class ApplyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'datetime' })
  start_date: Date;

  @Column({ type: 'datetime' })
  end_date: Date;

  @Column()
  apply_status: string;

  @Column()
  room_number: string;

  @Column({ nullable: true })
  reject_reason: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
