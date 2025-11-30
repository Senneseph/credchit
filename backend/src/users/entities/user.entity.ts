import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Balance } from '../../balances/entities/balance.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  achLinked: boolean;

  @Column({ nullable: true })
  achAccountId: string;

  @Column({ default: 0 })
  credLevel: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Balance, balance => balance.user)
  balance: Balance;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

