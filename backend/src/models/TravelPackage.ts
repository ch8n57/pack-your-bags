import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Provider } from './Provider';

@Entity('travel_packages')
export class TravelPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  destination: string;

  @Column('text')
  description: string;

  @Column('decimal')
  price: number;

  @Column()
  duration: number;

  @Column('simple-array')
  inclusions: string[];

  @Column()
  maxTravelers: number;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Provider)
  @JoinColumn()
  provider: Provider;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}