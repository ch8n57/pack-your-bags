import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { TravelPackage } from './TravelPackage';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => TravelPackage)
  @JoinColumn()
  travelPackage: TravelPackage;

  @Column()
  numberOfTravelers: number;

  @Column('decimal')
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  })
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  @Column('date')
  travelDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  travelerDetails: {
    name: string;
    age: number;
    idNumber: string;
  }[];

  @Column({ nullable: true })
  paymentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}