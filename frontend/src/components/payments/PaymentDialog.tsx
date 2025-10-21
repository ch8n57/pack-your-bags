import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { CheckoutForm } from './CheckoutForm';
import { payments } from '../../api';
import { Toast } from '../shared/Toast';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  onPaymentSuccess: () => void;
}

export const PaymentDialog = ({ open, onClose, bookingId, amount, onPaymentSuccess }: PaymentDialogProps) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
  });

  useEffect(() => {
    if (open && bookingId) {
      initializePayment();
    }
  }, [open, bookingId]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const response = await payments.createPaymentIntent(bookingId);
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      setToast({
        open: true,
        message: 'Error initializing payment',
        severity: 'error',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setToast({
      open: true,
      message: 'Payment successful!',
      severity: 'success',
    });
    onPaymentSuccess();
    onClose();
  };

  const handlePaymentError = (message: string) => {
    setToast({
      open: true,
      message,
      severity: 'error',
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            clientSecret && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
};