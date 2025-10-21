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
  status: 'pending' | 'confirmed' | 'cancelled';
  travelDate: string;
  createdAt: string;
}

export const MyBookings = () => {
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Bookings
        </Typography>
        <Grid container spacing={3}>
          {userBookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {booking.travelPackage.name}
                  </Typography>
                  <Typography color="text.secondary">
                    Destination: {booking.travelPackage.destination}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography>
                      Travel Date: {new Date(booking.travelDate).toLocaleDateString()}
                    </Typography>
                    <Typography>
                      Number of Travelers: {booking.numberOfTravelers}
                    </Typography>
                    <Typography>
                      Total Price: ${Number(booking.totalPrice).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={booking.status.toUpperCase()}
                      color={getStatusColor(booking.status) as any}
                    />
                    {booking.status === 'pending' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() =>
                          bookings.updateStatus(booking.id, 'cancelled')
                        }
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {userBookings.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" align="center" color="text.secondary">
                No bookings found
              </Typography>
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