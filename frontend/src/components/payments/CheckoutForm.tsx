import { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export const CheckoutForm = ({ clientSecret, amount, onSuccess, onError }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (error) {
        onError(error.message || 'An error occurred while processing your payment.');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      onError('An unexpected error occurred.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Total Amount: ${amount.toFixed(2)}
        </Typography>
      </Box>
      
      <Box sx={{ 
        border: '1px solid #ccc', 
        p: 2, 
        borderRadius: 1,
        mb: 2,
        '& .StripeElement': {
          width: '100%',
        }
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
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || processing}
        sx={{ mt: 2 }}
      >
        {processing ? (
          <CircularProgress size={24} />
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </Box>
  );
};