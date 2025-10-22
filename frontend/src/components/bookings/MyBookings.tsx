import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import { bookings } from '../../api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Toast } from '../shared/Toast';

interface Booking {
  id: string;
  travelPackage: {
    id: string;
    name: string;
    destination: string;
    price: number;
    duration: number;
  };
  numberOfTravelers: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  travelDate: string;
  createdAt: string;
}

export const MyBookings = () => {
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const response = await bookings.getUserBookings();
      setUserBookings(response.data);
    } catch (error) {
      setToast({
        open: true,
        message: 'Error fetching bookings',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingBookingId(bookingId);
      await bookings.updateStatus(bookingId, 'cancelled');
      
      setToast({
        open: true,
        message: 'Booking cancelled successfully',
        severity: 'success',
      });
      
      // Refresh bookings list
      await fetchUserBookings();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      setToast({
        open: true,
        message: error.response?.data?.message || 'Error cancelling booking',
        severity: 'error',
      });
    } finally {
      setCancellingBookingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="lg" sx={{ animation: 'fadeIn 0.6s ease' }}>
      <Box sx={{ my: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 4 }}>
          My Bookings
        </Typography>
        <Grid container spacing={4}>
          {userBookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking.id}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                    {booking.travelPackage.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <span style={{ fontSize: '1.2rem' }}>📍</span>
                    Destination: {booking.travelPackage.destination}
                  </Typography>
                  <Box sx={{ mt: 3, p: 2.5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography sx={{ mb: 1, fontWeight: 500 }}>
                      Travel Date: {new Date(booking.travelDate).toLocaleDateString()}
                    </Typography>
                    <Typography sx={{ mb: 1, fontWeight: 500 }}>
                      Number of Travelers: {booking.numberOfTravelers}
                    </Typography>
                    <Typography sx={{ mb: 1, fontWeight: 500 }}>
                      Total Price: ${Number(booking.totalPrice).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={booking.status.toUpperCase()}
                      color={getStatusColor(booking.status) as any}
                      sx={{ fontWeight: 600, px: 1 }}
                    />
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingBookingId === booking.id}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                      >
                        {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {userBookings.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h4" sx={{ mb: 2, fontSize: '3rem' }}>🌍</Typography>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  No bookings yet
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Start exploring our travel packages and book your next adventure!
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  );
};