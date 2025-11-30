import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Balance } from '../../balances/entities/balance.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  category: string;

  @Column({ unique: true })
  apiKey: string;

  @Column({ default: 0 })
  trustBadgeLevel: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Balance, balance => balance.merchant)
  balance: Balance;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

