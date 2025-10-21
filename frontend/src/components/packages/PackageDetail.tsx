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
    <Container>
      <Box sx={{ my: 4 }}>
        <Card>
          <CardMedia
            component="img"
            height="400"
            image={`/images/packages/${travelPackage.destination}${travelPackage.destination === 'Taj Mahal' ? '.avif' : travelPackage.destination === 'Heads' ? '.jpeg' : travelPackage.destination === 'Temple' ? '.jpeg' : '.jpg'}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/packages/default.jpg';
            }}
            alt={travelPackage.destination}
          />
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {travelPackage.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {travelPackage.destination}
            </Typography>
            <Typography variant="body1" paragraph>
              {travelPackage.description}
            </Typography>
            <Box sx={{ my: 3 }}>
              <Typography variant="h5" gutterBottom>
                Package Details
              </Typography>
              <Typography variant="h6">
                Price: ${Number(travelPackage.price).toFixed(2)} per person
              </Typography>
              <Typography variant="subtitle1">
                Duration: {travelPackage.duration} days
              </Typography>
              <Typography variant="subtitle1">
                Max Travelers: {travelPackage.maxTravelers}
              </Typography>
            </Box>
            <Box sx={{ my: 3 }}>
              <Typography variant="h5" gutterBottom>
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