import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Booking } from './Booking';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Booking)
  @JoinColumn()
  booking: Booking;

  @Column('decimal')
  amount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  })
  status: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ type: 'jsonb', nullable: true })
  paymentDetails: {
    provider: string;
    lastFourDigits?: string;
    expiryDate?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}