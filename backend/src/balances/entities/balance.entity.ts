import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';

@Entity('balances')
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 25 })
  autoRefillThreshold: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 50 })
  autoRefillAmount: number;

  @Column({ default: false })
  autoRefillEnabled: boolean;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  merchantId: string;

  @OneToOne(() => User, user => user.balance)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Merchant, merchant => merchant.balance)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

