import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User';
import { Booking } from './Booking';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;

  @ManyToOne(() => Booking)
  @JoinColumn()
  booking: Booking;

  @Column('text')
  content: string;

  @Column('boolean', { default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}