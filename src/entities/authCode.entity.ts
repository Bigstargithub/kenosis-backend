import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth_code')
export class AuthCodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  auth_code: string;

  @Column()
  is_verify: number;

  @Column()
  expired_at: Date;

  @Column()
  created_at: Date;
}
