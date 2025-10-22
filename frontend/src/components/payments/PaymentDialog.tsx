import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { payments } from '../../api';
import { Toast } from '../shared/Toast';
import { isStripeConfigured } from '../../lib/stripe';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number | undefined;
  onPaymentSuccess: () => void;
}

// Mock payment form for when Stripe is not configured
const MockPaymentForm = ({ bookingId, amount, onPaymentSuccess, onClose }: Omit<PaymentDialogProps, 'open'>) => {
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  // Ensure amount is a valid number
  const safeAmount = amount || 0;

  const handleMockPayment = async () => {
    try {
      setProcessing(true);
      const response = await payments.processAutoPayment(bookingId);
      
      setToast({
        open: true,
        message: 'Payment successful! Your booking has been confirmed.',
        severity: 'success',
      });
      
      onPaymentSuccess();
      onClose();
    } catch (error: any) {
      console.error('Payment error:', error);
      setToast({
        open: true,
        message: error.response?.data?.message || 'Payment failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Payment Summary
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Total Amount: <strong>${safeAmount.toFixed(2)}</strong>
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          This is a demo payment system. Click "Pay Now" to automatically process your payment and confirm your booking.
        </Alert>

        <Typography variant="body2" color="text.secondary">
          Your booking will be confirmed immediately upon payment.
        </Typography>
      </Box>

      <DialogActions>
        <Button onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          onClick={handleMockPayment}
          variant="contained"
          disabled={processing}
          sx={{ minWidth: 120 }}
        >
          {processing ? (
            <CircularProgress size={24} />
          ) : (
            `Pay $${safeAmount.toFixed(2)}`
          )}
        </Button>
      </DialogActions>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
};

// Stripe payment form
const StripePaymentForm = ({ bookingId, amount, onPaymentSuccess, onClose }: Omit<PaymentDialogProps, 'open'>) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  // Ensure amount is a valid number
  const safeAmount = amount || 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const { data } = await payments.createPaymentIntent(bookingId);
      
      // Confirm payment with Stripe
      const { error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (error) {
        setToast({
          open: true,
          message: error.message || 'Payment failed. Please try again.',
          severity: 'error',
        });
      } else {
        // Confirm payment on backend
        await payments.confirmPayment(data.clientSecret.split('_secret_')[0], bookingId);
        
        setToast({
          open: true,
          message: 'Payment successful! Your booking has been confirmed.',
          severity: 'success',
        });
        
        onPaymentSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setToast({
        open: true,
        message: error.response?.data?.message || 'Payment failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Payment Summary
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Total Amount: <strong>${safeAmount.toFixed(2)}</strong>
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Card Information
          </Typography>
          <Box sx={{ 
            p: 2, 
            border: '1px solid #e0e0e0', 
            borderRadius: 1,
            backgroundColor: '#fafafa'
          }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Your payment is secure and encrypted.
        </Typography>
      </Box>

      <DialogActions>
        <Button onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={processing || !stripe}
          sx={{ minWidth: 120 }}
          onClick={handleSubmit}
        >
          {processing ? (
            <CircularProgress size={24} />
          ) : (
            `Pay $${safeAmount.toFixed(2)}`
          )}
        </Button>
      </DialogActions>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
};

export const PaymentDialog = ({ open, onClose, bookingId, amount, onPaymentSuccess }: PaymentDialogProps) => {
  const stripePromise = isStripeConfigured() 
    ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!)
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete Payment</DialogTitle>
      <DialogContent>
        {isStripeConfigured() && stripePromise ? (
          <Elements stripe={stripePromise}>
            <StripePaymentForm
              bookingId={bookingId}
              amount={amount}
              onPaymentSuccess={onPaymentSuccess}
              onClose={onClose}
            />
          </Elements>
        ) : (
          <MockPaymentForm
            bookingId={bookingId}
            amount={amount}
            onPaymentSuccess={onPaymentSuccess}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};