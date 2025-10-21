import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { TravelPackage } from './TravelPackage';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column('text')
  description: string;

  @Column('text')
  address: string;

  @Column({
    type: 'enum',
    enum: ['hotel', 'transport', 'activity'],
  })
  type: 'hotel' | 'transport' | 'activity';

  @Column('boolean', { default: true })
  isActive: boolean;

  @OneToMany(() => TravelPackage, travelPackage => travelPackage.provider)
  packages: TravelPackage[];

  @CreateDateColumn()
  createdAt: Date;
}