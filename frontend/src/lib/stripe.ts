import { loadStripe } from '@stripe/stripe-js';

// Get Stripe public key with fallback for development
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder';

// Only initialize Stripe if we have a valid key
export const stripePromise = stripePublicKey !== 'pk_test_placeholder' 
  ? loadStripe(stripePublicKey)
  : null;

// Helper function to check if Stripe is configured
export const isStripeConfigured = () => stripePublicKey !== 'pk_test_placeholder';