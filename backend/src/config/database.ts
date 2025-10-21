import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { TravelPackage } from '../models/TravelPackage';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';
import { Itinerary } from '../models/Itinerary';
import { Message } from '../models/Message';
import { createSamplePackages } from '../seed/samplePackages';
import { seedUsers } from '../seed/users';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '2004',
  database: process.env.DB_NAME || 'pack_your_bags',
  synchronize: true, // Set to false in production
  logging: true,
  entities: [User, TravelPackage, Booking, Payment, Review, Itinerary, Message],
  subscribers: [],
  migrations: [],
});

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');
    await seedUsers();
    await createSamplePackages();
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });