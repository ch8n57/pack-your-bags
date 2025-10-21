import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { TravelPackage } from '../models/TravelPackage';
import { Booking } from '../models/Booking';

export class AdminController {
  static async manageUsers(_req: Request, res: Response) {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    res.json(users);
  }

  static async updatePackage(req: Request, res: Response) {
    const packageRepository = AppDataSource.getRepository(TravelPackage);
    const travelPackage = await packageRepository.findOne({ where: { id: req.params.id } });
    if (!travelPackage) return res.status(404).json({ message: 'Package not found' });
    packageRepository.merge(travelPackage, req.body);
    const saved = await packageRepository.save(travelPackage);
    res.json(saved);
  }

  static async viewBooking(req: Request, res: Response) {
    const bookingRepository = AppDataSource.getRepository(Booking);
    const booking = await bookingRepository.findOne({
      where: { id: req.params.id },
      relations: ['user', 'travelPackage'],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  }

  static async generateReports(_req: Request, res: Response) {
    const bookingRepository = AppDataSource.getRepository(Booking);
    const totalBookings = await bookingRepository.count();
    const confirmed = await bookingRepository.count({ where: { status: 'confirmed' as any } });
    const pending = await bookingRepository.count({ where: { status: 'pending' as any } });
    const cancelled = await bookingRepository.count({ where: { status: 'cancelled' as any } });
    const rows = await bookingRepository
      .createQueryBuilder('b')
      .select('SUM(b.totalPrice)', 'revenue')
      .where("b.status = 'confirmed'")
      .getRawOne();
    res.json({ totalBookings, confirmed, pending, cancelled, revenue: Number(rows?.revenue || 0) });
  }
}
