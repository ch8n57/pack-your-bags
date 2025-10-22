import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from '../config/database';
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { User } from '../models/User';

// Initialize Stripe with fallback for development
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = stripeSecretKey !== 'sk_test_placeholder' 
  ? new Stripe(stripeSecretKey)
  : null;

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export class PaymentController {
  static async createPaymentIntent(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.body;

      const bookingRepository = AppDataSource.getRepository(Booking);
      const booking = await bookingRepository.findOne({ 
        where: { id: bookingId },
        relations: ['travelPackage']
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // If Stripe is not configured, return a mock client secret for development
      if (!stripe) {
        console.log('Stripe not configured, using mock payment intent');
        return res.json({
          clientSecret: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }

      // Create a PaymentIntent with the booking amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalPrice * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          bookingId: booking.id,
          packageName: booking.travelPackage.name
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: 'Error creating payment' });
    }
  }

  static async handleStripeWebhook(req: Request, res: Response) {
    // Webhook endpoint - currently disabled since webhook is not set up
    console.log('Webhook endpoint called but webhook is not configured');
    res.json({ 
      received: true, 
      message: 'Webhook endpoint is available but webhook is not configured' 
    });
  }

  private static async handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
    const bookingRepository = AppDataSource.getRepository(Booking);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const userRepository = AppDataSource.getRepository(User);

    const booking = await bookingRepository.findOne({
      where: { id: paymentIntent.metadata.bookingId },
      relations: ['user']
    });

    if (booking) {
      // Update booking status
      booking.status = 'confirmed';
      await bookingRepository.save(booking);

      // Create payment record
      const payment = paymentRepository.create({
        booking,
        amount: booking.totalPrice,
        status: 'completed',
        transactionId: paymentIntent.id,
        paymentMode: 'card',
        paymentDetails: {
          provider: 'stripe'
        }
      });

      await paymentRepository.save(payment);
    }
  }

  static async confirmPayment(req: AuthRequest, res: Response) {
    try {
      const { paymentIntentId, bookingId } = req.body;

      // If Stripe is not configured, handle mock payment
      if (!stripe) {
        console.log('Stripe not configured, processing mock payment');
        
        const bookingRepository = AppDataSource.getRepository(Booking);
        const paymentRepository = AppDataSource.getRepository(Payment);

        const booking = await bookingRepository.findOne({
          where: { id: bookingId },
          relations: ['user']
        });

        if (!booking) {
          return res.status(404).json({ message: 'Booking not found' });
        }

        // Update booking status
        booking.status = 'confirmed';
        await bookingRepository.save(booking);

        // Create payment record
        const payment = paymentRepository.create({
          booking,
          amount: booking.totalPrice,
          status: 'completed',
          transactionId: paymentIntentId,
          paymentMode: 'mock',
          paymentDetails: {
            provider: 'mock'
          }
        });

        await paymentRepository.save(payment);

        return res.json({ message: 'Mock payment confirmed successfully' });
      }

      // Verify the payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: 'Payment not successful' });
      }

      // Handle the successful payment
      await PaymentController.handleSuccessfulPayment(paymentIntent);

      res.json({ message: 'Payment confirmed successfully' });
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({ message: 'Error confirming payment' });
    }
  }

  static async getPaymentHistory(req: AuthRequest, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const payments = await paymentRepository.find({
        where: { 
          booking: { 
            user: { id: req.user?.userId } 
          } 
        },
        relations: ['booking', 'booking.travelPackage', 'booking.user'],
        order: {
          createdAt: 'DESC'
        }
      });

      res.json(payments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ message: 'Error fetching payment history' });
    }
  }

  static async processAutoPayment(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.body;

      const bookingRepository = AppDataSource.getRepository(Booking);
      const paymentRepository = AppDataSource.getRepository(Payment);

      const booking = await bookingRepository.findOne({ 
        where: { id: bookingId },
        relations: ['travelPackage', 'user']
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if booking belongs to the authenticated user
      if (booking.user.id !== req.user?.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Update booking status to confirmed
      booking.status = 'confirmed';
      await bookingRepository.save(booking);

      // Find existing payment record and update it
      const existingPayment = await paymentRepository.findOne({
        where: { booking: { id: bookingId } }
      });

      let payment;
      if (existingPayment) {
        // Update existing payment
        existingPayment.status = 'completed';
        existingPayment.transactionId = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        existingPayment.paymentMode = 'auto';
        existingPayment.paymentDetails = {
          provider: 'auto'
        };
        await paymentRepository.save(existingPayment);
        payment = existingPayment;
      } else {
        // Create new payment record if none exists
        payment = paymentRepository.create({
          booking,
          amount: booking.totalPrice,
          status: 'completed',
          transactionId: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentMode: 'auto',
          paymentDetails: {
            provider: 'auto'
          }
        });
        await paymentRepository.save(payment);
      }

      res.json({ 
        message: 'Payment processed successfully',
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId
        }
      });
    } catch (error) {
      console.error('Error processing auto payment:', error);
      res.status(500).json({ message: 'Error processing payment' });
    }
  }

  static async processRefund(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { paymentId } = req.params;
      const paymentRepository = AppDataSource.getRepository(Payment);
      const payment = await paymentRepository.findOne({ 
        where: { id: paymentId },
        relations: ['booking'] 
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // If Stripe is not configured, handle mock refund
      if (!stripe) {
        console.log('Stripe not configured, processing mock refund');
        
        // Update payment status
        payment.status = 'refunded';
        await paymentRepository.save(payment);

        // Update booking status
        const bookingRepository = AppDataSource.getRepository(Booking);
        const booking = payment.booking;
        booking.status = 'cancelled';
        await bookingRepository.save(booking);

        return res.json({ message: 'Mock refund processed successfully' });
      }

      // Process refund through Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.transactionId
      });

      // Update payment status
      payment.status = 'refunded';
      await paymentRepository.save(payment);

      // Update booking status
      const bookingRepository = AppDataSource.getRepository(Booking);
      const booking = payment.booking;
      booking.status = 'cancelled';
      await bookingRepository.save(booking);

      res.json({ message: 'Refund processed successfully' });
    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({ message: 'Error processing refund' });
    }
  }
}