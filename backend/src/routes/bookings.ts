import express from 'express';
import { BookingController } from '../controllers/BookingController';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// User routes
router.post('/', auth, BookingController.createBooking);
router.get('/my-bookings', auth, BookingController.getUserBookings);

// Admin routes
router.get('/all', [auth, adminAuth], BookingController.getAllBookings);

// User routes (users can update their own bookings, admins can update any)
router.patch('/:id/status', auth, BookingController.updateBookingStatus);

export default router;