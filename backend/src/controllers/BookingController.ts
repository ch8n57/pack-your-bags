import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { TravelPackage } from '../models/TravelPackage';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';

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
      res.status(201).json(booking);
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

  static async updateBookingStatus(req: Request, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(Booking);
      const { id } = req.params;
      const { status } = req.body;

      const booking = await bookingRepository.findOne({ where: { id } });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
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