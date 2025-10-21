import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { TravelPackage } from './TravelPackage';

@Entity('itineraries')
export class Itinerary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => TravelPackage)
  @JoinColumn()
  travelPackage: TravelPackage;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('jsonb')
  items: {
    day: number;
    activities: {
      time: string;
      description: string;
      location: string;
    }[];
  }[];

  @Column('date', { nullable: true })
  travelDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;
}