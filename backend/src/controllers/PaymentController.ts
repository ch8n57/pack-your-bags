import { Request, Response } from 'express';
import Stripe from 'stripe';
import { AppDataSource } from '../config/database';
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { User } from '../models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

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
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await PaymentController.handleSuccessfulPayment(paymentIntent);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook Error:', error);
      res.status(400).send(`Webhook Error: ${error?.message || 'Unknown error'}`);
    }
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