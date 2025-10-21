import express from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', auth, PaymentController.createPaymentIntent);

// Handle Stripe webhook
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), PaymentController.handleStripeWebhook);

// Get payment history
router.get('/history', auth, PaymentController.getPaymentHistory);

// Process refund (admin only)
router.post('/:paymentId/refund', auth, PaymentController.processRefund);

export default router;