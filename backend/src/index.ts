import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppDataSource } from './config/database';
import { createSamplePackages } from './seed/samplePackages';
import { seedUsers } from './seed/users';

// Import routes
import authRoutes from './routes/auth';
import packageRoutes from './routes/packages';
import bookingRoutes from './routes/bookings';
import reviewRoutes from './routes/reviews';
import itineraryRoutes from './routes/itineraries';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database connection and start server
async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');
    
    try {
      await seedUsers();
      await createSamplePackages();
      console.log('Seeding completed');
    } catch (seedErr) {
      console.error('Seeding error:', seedErr);
    }

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/packages', packageRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/itineraries', itineraryRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/admin', adminRoutes);

    // Basic route
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to Pack Your Bags API' });
    });

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    // Start server
    const PORT = process.env.PORT || 9000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

startServer();