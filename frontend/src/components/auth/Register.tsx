import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
} from '@mui/material';
import { auth } from '../../api';
import type { RegisterData } from '../../api';
import { Toast } from '../shared/Toast';
import axios from 'axios';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phoneNumber) {
        setToast({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error',
        });
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        setToast({
          open: true,
          message: 'Passwords do not match',
          severity: 'error',
        });
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        setToast({
          open: true,
          message: 'Password must be at least 6 characters long',
          severity: 'error',
        });
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setToast({
          open: true,
          message: 'Please enter a valid email address',
          severity: 'error',
        });
        return;
      }

      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      console.log('Sending registration data:', registrationData);
      const response = await auth.register(registrationData);
      console.log('Registration response:', response.data);
      
      if (response.data.token && response.data.user) {
        const successMessage = response.data.message || 'Registration successful! Please login.';
        setToast({
          open: true,
          message: successMessage,
          severity: 'success',
        });
        // Clear form data
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error)) {
        // Log detailed error information
        console.error('Axios error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        
        // Handle validation errors
        if (error.response?.data?.errors) {
          const validationErrors = error.response.data.errors
            .map((err: any) => Object.values(err.constraints))
            .flat()
            .join(', ');
          setToast({
            open: true,
            message: `Validation failed: ${validationErrors}`,
            severity: 'error',
          });
        } else {
          // Handle other errors
          const errorMessage = error.response?.data?.message || error.message;
          setToast({
            open: true,
            message: `Registration failed: ${errorMessage}`,
            severity: 'error',
          });
        }
      } else {
        console.error('Non-Axios error:', error);
        setToast({
          open: true,
          message: 'Registration failed. Please try again.',
          severity: 'error',
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center">
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                helperText="Enter a valid email address"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                helperText="Password must be at least 6 characters"
                inputProps={{
                  minLength: 6
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                helperText={formData.password !== formData.confirmPassword && formData.confirmPassword !== '' ? 'Passwords do not match' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="phoneNumber"
                label="Phone Number"
                type="tel"
                id="phoneNumber"
                helperText="Enter a valid phone number"
                inputProps={{
                  pattern: "[0-9]{10}"
                }}
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
          >
            Already have an account? Sign in
          </Button>
        </Box>
      </Paper>
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  );
};