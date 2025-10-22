import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { payments } from '../../api';
import { Toast } from '../shared/Toast';
import { isStripeConfigured } from '../../lib/stripe';

interface CheckoutFormProps {
  bookingId: string;
  amount: number | undefined;
  onPaymentSuccess: () => void;
}

type PaymentMethod = 'auto' | 'stripe' | 'bank_transfer' | 'wallet';

export const CheckoutForm = ({ bookingId, amount, onPaymentSuccess }: CheckoutFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('auto');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  // Ensure amount is a valid number
  const safeAmount = amount || 0;

  const handlePayment = async () => {
    try {
      setProcessing(true);

      let response;
      switch (paymentMethod) {
        case 'auto':
          response = await payments.processAutoPayment(bookingId);
          break;
        case 'stripe':
          if (!isStripeConfigured()) {
            throw new Error('Stripe is not configured. Please use auto payment instead.');
          }
          // This would typically open a Stripe Elements dialog
          response = await payments.processAutoPayment(bookingId);
          break;
        case 'bank_transfer':
          // Mock bank transfer
          response = await payments.processAutoPayment(bookingId);
          break;
        case 'wallet':
          // Mock wallet payment
          response = await payments.processAutoPayment(bookingId);
          break;
        default:
          throw new Error('Invalid payment method');
      }

      setToast({
        open: true,
        message: 'Payment successful! Your booking has been confirmed.',
        severity: 'success',
      });
      
      onPaymentSuccess();
    } catch (error: any) {
      console.error('Payment error:', error);
      setToast({
        open: true,
        message: error.response?.data?.message || error.message || 'Payment failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentMethodDescription = (method: PaymentMethod) => {
    switch (method) {
      case 'auto':
        return 'Instant payment processing for demo purposes';
      case 'stripe':
        return 'Secure payment with credit/debit card via Stripe';
      case 'bank_transfer':
        return 'Direct bank transfer (processing time: 1-3 business days)';
      case 'wallet':
        return 'Pay using digital wallet (PayPal, Apple Pay, Google Pay)';
      default:
        return '';
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'auto':
        return '⚡';
      case 'stripe':
        return '💳';
      case 'bank_transfer':
        return '🏦';
      case 'wallet':
        return '📱';
      default:
        return '';
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Payment Details
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary">
              Total Amount: ${safeAmount.toFixed(2)}
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <MenuItem value="auto">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{getPaymentMethodIcon('auto')}</span>
                  <span>Auto Payment (Demo)</span>
                </Box>
              </MenuItem>
              {isStripeConfigured() && (
                <MenuItem value="stripe">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{getPaymentMethodIcon('stripe')}</span>
                    <span>Credit/Debit Card</span>
                  </Box>
                </MenuItem>
              )}
              <MenuItem value="bank_transfer">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{getPaymentMethodIcon('bank_transfer')}</span>
                  <span>Bank Transfer</span>
                </Box>
              </MenuItem>
              <MenuItem value="wallet">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{getPaymentMethodIcon('wallet')}</span>
                  <span>Digital Wallet</span>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ mb: 3 }}>
            {getPaymentMethodDescription(paymentMethod)}
          </Alert>

          {paymentMethod === 'bank_transfer' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Bank Transfer Details
              </Typography>
              <TextField
                fullWidth
                label="Account Holder Name"
                variant="outlined"
                sx={{ mb: 2 }}
                defaultValue="Pack Your Bags Travel Agency"
                disabled
              />
              <TextField
                fullWidth
                label="Account Number"
                variant="outlined"
                sx={{ mb: 2 }}
                defaultValue="1234567890"
                disabled
              />
              <TextField
                fullWidth
                label="Bank Name"
                variant="outlined"
                sx={{ mb: 2 }}
                defaultValue="Demo Bank"
                disabled
              />
              <TextField
                fullWidth
                label="Reference"
                variant="outlined"
                defaultValue={`BOOKING-${bookingId.slice(0, 8).toUpperCase()}`}
                disabled
              />
            </Box>
          )}

          {paymentMethod === 'wallet' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Digital Wallet Options
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" disabled>
                  PayPal
                </Button>
                <Button variant="outlined" disabled>
                  Apple Pay
                </Button>
                <Button variant="outlined" disabled>
                  Google Pay
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Digital wallet integration coming soon. Please use auto payment for now.
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              By proceeding, you agree to our terms and conditions.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handlePayment}
              disabled={processing}
              sx={{ minWidth: 150 }}
            >
              {processing ? (
                <CircularProgress size={24} />
              ) : (
                `Pay $${safeAmount.toFixed(2)}`
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
};