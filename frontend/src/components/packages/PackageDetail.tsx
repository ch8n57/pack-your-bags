import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { packages, bookings } from '../../api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Toast } from '../shared/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentDialog } from '../payments/PaymentDialog';
import type { Booking } from '../../types';

interface TravelPackage {
  id: string;
  name: string;
  destination: string;
  description: string;
  price: number;
  duration: number;
  maxTravelers: number;
  inclusions: string[];
}

export const PackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [travelPackage, setTravelPackage] = useState<TravelPackage | null>(null);

  const parseResponse = (data: any): TravelPackage => ({
    ...data,
    price: Number(data.price),
    duration: Number(data.duration),
    maxTravelers: Number(data.maxTravelers)
  });
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    numberOfTravelers: 1,
    travelDate: '',
  });
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (id) {
      fetchPackageDetails();
    }
  }, [id]);

  const fetchPackageDetails = async () => {
    try {
      const response = await packages.getById(id!);
      setTravelPackage(parseResponse(response.data));
    } catch (error) {
      setToast({
        open: true,
        message: 'Error fetching package details',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      setToast({
        open: true,
        message: 'Please login to book a package',
        severity: 'warning',
      });
      navigate('/login');
      return;
    }

    if (!id) {
      setToast({
        open: true,
        message: 'Invalid package ID',
        severity: 'error',
      });
      return;
    }

    try {
      const bookingPayload = {
        travelPackageId: id,
        ...bookingData,
        travelerDetails: [],
        numberOfTravelers: Number(bookingData.numberOfTravelers)
      };
      const response = await bookings.create(bookingPayload);
      setBookingDialogOpen(false);
      setPaymentDialogOpen(true);
      setCurrentBooking(response.data);
    } catch (error: any) {
      setToast({
        open: true,
        message: error.response?.data?.message || 'Error creating booking',
        severity: 'error',
      });
      console.error('Booking error:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!travelPackage) return null;

  return (
    <Container maxWidth="lg" sx={{ animation: 'fadeIn 0.6s ease' }}>
      <Box sx={{ my: 6 }}>
        <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <CardMedia
            component="img"
            height="500"
            image={`/images/packages/${travelPackage.destination}${travelPackage.destination === 'Taj Mahal' ? '.avif' : travelPackage.destination === 'Heads' ? '.jpeg' : travelPackage.destination === 'Temple' ? '.jpeg' : '.jpg'}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/packages/default.jpg';
            }}
            alt={travelPackage.destination}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ p: 5 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 2 }}>
              {travelPackage.name}
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <span style={{ fontSize: '1.5rem' }}>📍</span>
              {travelPackage.destination}
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary', mb: 4 }}>
              {travelPackage.description}
            </Typography>
            <Box sx={{ my: 5, p: 4, bgcolor: 'rgba(25, 118, 210, 0.04)', borderRadius: 3, border: '1px solid rgba(25, 118, 210, 0.1)' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Package Details
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
                Price: ${Number(travelPackage.price).toFixed(2)} per person
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 500 }}>
                Duration: {travelPackage.duration} days
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 500 }}>
                Max Travelers: {travelPackage.maxTravelers}
              </Typography>
            </Box>
            <Box sx={{ my: 5 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Inclusions
              </Typography>
              <List>
                {travelPackage.inclusions.map((inclusion, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={inclusion} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setBookingDialogOpen(true)}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 3,
                boxShadow: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.35)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Book Now
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)}>
        <DialogTitle>Book Package</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Number of Travelers"
            type="number"
            fullWidth
            value={bookingData.numberOfTravelers}
            onChange={(e) =>
              setBookingData({
                ...bookingData,
                numberOfTravelers: parseInt(e.target.value),
              })
            }
            InputProps={{ inputProps: { min: 1, max: travelPackage.maxTravelers } }}
          />
          <TextField
            margin="dense"
            label="Travel Date"
            type="date"
            fullWidth
            value={bookingData.travelDate}
            onChange={(e) =>
              setBookingData({ ...bookingData, travelDate: e.target.value })
            }
            InputProps={{
              inputProps: {
                min: new Date().toISOString().split('T')[0]
              }
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBooking} variant="contained">
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />

      {currentBooking && (
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          bookingId={currentBooking.id}
          amount={currentBooking.totalPrice}
          onPaymentSuccess={() => {
            setToast({
              open: true,
              message: 'Booking and payment completed successfully!',
              severity: 'success',
            });
            navigate('/my-bookings');
          }}
        />
      )}
    </Container>
  );
};