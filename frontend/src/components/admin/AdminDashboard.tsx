import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Tooltip,
  TableSortLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { packages, bookings } from '../../api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Toast } from '../shared/Toast';

import type { Booking, TravelPackage } from '../../types';

export const AdminDashboard = () => {
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [packagesList, setPackagesList] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [packageDialog, setPackageDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Booking | keyof TravelPackage;
    direction: 'asc' | 'desc';
  }>({ key: 'name', direction: 'asc' });

  const [newPackage, setNewPackage] = useState({
    name: '',
    destination: '',
    description: '',
    price: '',
    duration: '',
    maxTravelers: '',
    inclusions: [] as string[],
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, packagesRes] = await Promise.all([
        bookings.getAllBookings(),
        packages.getAll(),
      ]);
      setBookingsList(bookingsRes.data);
      setPackagesList(packagesRes.data);
    } catch (error) {
      setToast({
        open: true,
        message: 'Error fetching data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePackageAction = async () => {
    try {
      const packageData = {
        ...newPackage,
        price: parseFloat(newPackage.price),
        duration: parseInt(newPackage.duration),
        maxTravelers: parseInt(newPackage.maxTravelers),
      };

      if (selectedPackage) {
        await packages.update(selectedPackage.id, packageData);
        setToast({
          open: true,
          message: 'Package updated successfully',
          severity: 'success',
        });
      } else {
        await packages.create(packageData);
        setToast({
          open: true,
          message: 'Package created successfully',
          severity: 'success',
        });
      }
      setPackageDialog(false);
      setSelectedPackage(null);
      setNewPackage({
        name: '',
        destination: '',
        description: '',
        price: '',
        duration: '',
        maxTravelers: '',
        inclusions: [],
      });
      fetchData();
    } catch (error) {
      setToast({
        open: true,
        message: `Error ${selectedPackage ? 'updating' : 'creating'} package`,
        severity: 'error',
      });
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      await packages.delete(packageId);
      setToast({
        open: true,
        message: 'Package deleted successfully',
        severity: 'success',
      });
      fetchData();
    } catch (error) {
      setToast({
        open: true,
        message: 'Error deleting package',
        severity: 'error',
      });
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      await bookings.updateStatus(bookingId, status);
      setToast({
        open: true,
        message: 'Booking status updated',
        severity: 'success',
      });
      fetchData();
    } catch (error) {
      setToast({
        open: true,
        message: 'Error updating booking status',
        severity: 'error',
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Bookings
                </Typography>
                <Typography variant="h5">
                  {bookingsList.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {bookingsList.filter(b => b.status === 'pending').length} pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Packages
                </Typography>
                <Typography variant="h5">
                  {packagesList.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {packagesList.filter(p => p.isAvailable).length} available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5">
                  ${bookingsList
                    .filter(b => b.status === 'confirmed')
                    .reduce((sum, b) => sum + Number(b.totalPrice), 0)
                    .toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  From confirmed bookings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Travel Packages
          </Typography>
          <Button
            variant="contained"
            onClick={() => setPackageDialog(true)}
            sx={{ mb: 2 }}
          >
            Add New Package
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'name'}
                      direction={sortConfig.direction}
                      onClick={() => setSortConfig({
                        key: 'name',
                        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                      })}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'price'}
                      direction={sortConfig.direction}
                      onClick={() => setSortConfig({
                        key: 'price',
                        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                      })}
                    >
                      Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Max Travelers</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...packagesList]
                  .sort((a, b) => {
                    const key = sortConfig.key as keyof TravelPackage;
                    const aValue = a[key] ?? '';
                    const bValue = b[key] ?? '';
                    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                  })
                  .map((pack) => (
                    <TableRow key={pack.id}>
                      <TableCell>{pack.name}</TableCell>
                      <TableCell>{pack.destination}</TableCell>
                      <TableCell>${pack.price.toFixed(2)}</TableCell>
                      <TableCell>{pack.duration} days</TableCell>
                      <TableCell>{pack.maxTravelers}</TableCell>
                      <TableCell>
                        <Chip
                          label={pack.isAvailable ? 'Active' : 'Inactive'}
                          color={pack.isAvailable ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedPackage(pack);
                              setNewPackage({
                                name: pack.name,
                                destination: pack.destination,
                                description: pack.description,
                                price: String(pack.price),
                                duration: String(pack.duration),
                                maxTravelers: String(pack.maxTravelers),
                                inclusions: pack.inclusions,
                              });
                              setPackageDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeletePackage(pack.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography variant="h5" gutterBottom>
            Bookings
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Travel Date</TableCell>
                  <TableCell>Travelers</TableCell>
                  <TableCell>Total Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingsList.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {booking.user.firstName} {booking.user.lastName}
                      <br />
                      <Typography variant="caption">{booking.user.email}</Typography>
                    </TableCell>
                    <TableCell>{booking.travelPackage.name}</TableCell>
                    <TableCell>
                      {new Date(booking.travelDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{booking.numberOfTravelers}</TableCell>
                    <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>{booking.status}</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={booking.status}
                          onChange={(e) =>
                            handleUpdateBookingStatus(
                              booking.id,
                              e.target.value as 'pending' | 'confirmed' | 'cancelled'
                            )
                          }
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="confirmed">Confirmed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <Dialog open={packageDialog} onClose={() => setPackageDialog(false)}>
        <DialogTitle>{selectedPackage ? 'Edit Package' : 'Create New Package'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Package Name"
            fullWidth
            value={newPackage.name}
            onChange={(e) =>
              setNewPackage({ ...newPackage, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Destination"
            fullWidth
            value={newPackage.destination}
            onChange={(e) =>
              setNewPackage({ ...newPackage, destination: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newPackage.description}
            onChange={(e) =>
              setNewPackage({ ...newPackage, description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={newPackage.price}
            onChange={(e) =>
              setNewPackage({ ...newPackage, price: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Duration (days)"
            type="number"
            fullWidth
            value={newPackage.duration}
            onChange={(e) =>
              setNewPackage({ ...newPackage, duration: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Max Travelers"
            type="number"
            fullWidth
            value={newPackage.maxTravelers}
            onChange={(e) =>
              setNewPackage({ ...newPackage, maxTravelers: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPackageDialog(false)}>Cancel</Button>
          <Button onClick={handlePackageAction} variant="contained">
            {selectedPackage ? 'Update Package' : 'Create Package'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  );
};