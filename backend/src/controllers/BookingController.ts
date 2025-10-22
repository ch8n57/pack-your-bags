import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { TravelPackage } from '../models/TravelPackage';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';
import { Payment } from '../models/Payment';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export class BookingController {
  static async createBooking(req: AuthRequest, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(Booking);
      const packageRepository = AppDataSource.getRepository(TravelPackage);
      const userRepository = AppDataSource.getRepository(User);

      const { travelPackageId, numberOfTravelers, travelDate, travelerDetails } = req.body;

      // Get the travel package
      const travelPackage = await packageRepository.findOne({ where: { id: travelPackageId } });
      if (!travelPackage) {
        return res.status(404).json({ message: 'Travel package not found' });
      }

      // Get the user
      const user = await userRepository.findOne({ where: { id: req.user?.userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Calculate total price
      const totalPrice = Number((travelPackage.price * numberOfTravelers).toFixed(2));

      // Create booking
      const booking = bookingRepository.create({
        user,
        travelPackage,
        numberOfTravelers,
        totalPrice,
        travelDate,
        travelerDetails,
        status: 'pending'
      });

      await bookingRepository.save(booking);

      // Create a pending payment record (client will complete via Stripe intent)
      const paymentRepository = AppDataSource.getRepository(Payment);
      const payment = paymentRepository.create({
        booking,
        amount: booking.totalPrice,
        status: 'pending',
        paymentDetails: { provider: 'stripe' },
      });
      await paymentRepository.save(payment);

      res.status(201).json({ booking, paymentId: payment.id });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Error creating booking' });
    }
  }

  static async getUserBookings(req: AuthRequest, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(Booking);
      const bookings = await bookingRepository.find({
        where: { user: { id: req.user?.userId } },
        relations: ['travelPackage']
      });
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  }

  static async getAllBookings(req: Request, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(Booking);
      const bookings = await bookingRepository.find({
        relations: ['user', 'travelPackage']
      });
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  }

  static async updateBookingStatus(req: AuthRequest, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(Booking);
      const { id } = req.params;
      const { status } = req.body;

      const booking = await bookingRepository.findOne({ 
        where: { id },
        relations: ['user']
      });
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if user is admin or the booking owner
      if (req.user?.role !== 'admin' && booking.user.id !== req.user?.userId) {
        return res.status(403).json({ message: 'Unauthorized to update this booking' });
      }

      // If cancelling a confirmed booking, handle payment refund
      if (booking.status === 'confirmed' && status === 'cancelled') {
        const paymentRepository = AppDataSource.getRepository(Payment);
        const payment = await paymentRepository.findOne({
          where: { booking: { id } }
        });

        if (payment && payment.status === 'completed') {
          // Update payment status to refunded
          payment.status = 'refunded';
          await paymentRepository.save(payment);
        }
      }

      booking.status = status;
      await bookingRepository.save(booking);
      res.json(booking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ message: 'Error updating booking status' });
    }
  }
}