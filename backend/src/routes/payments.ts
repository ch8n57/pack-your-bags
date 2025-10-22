import express from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', auth, PaymentController.createPaymentIntent);

// Confirm payment (alternative to webhook)
router.post('/confirm-payment', auth, PaymentController.confirmPayment);

// Auto payment (simplified payment processing)
router.post('/auto-payment', auth, PaymentController.processAutoPayment);

// Handle Stripe webhook
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), PaymentController.handleStripeWebhook);

// Get payment history
router.get('/history', auth, PaymentController.getPaymentHistory);

// Process refund (admin only)
router.post('/:paymentId/refund', auth, PaymentController.processRefund);

export default router;