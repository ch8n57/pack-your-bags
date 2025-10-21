import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../api';
import { Toast } from '../shared/Toast';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await auth.login(formData);
      login(response.data.token, response.data.user);
      setToast({
        open: true,
        message: 'Login successful!',
        severity: 'success',
      });
      navigate('/');
    } catch (error) {
      setToast({
        open: true,
        message: 'Login failed. Please check your credentials.',
        severity: 'error',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ animation: 'fadeIn 0.6s ease' }}>
      <Paper elevation={0} sx={{ p: 5, mt: 8, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography component="h1" variant="h4" align="center" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.02em' }}>
          Login
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Welcome back! Please enter your credentials
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.02)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
                }
              }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.02)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
                }
              }
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 4,
              mb: 2,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(25, 118, 210, 0.35)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/register')}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.03)'
              }
            }}
          >
            Don't have an account? Sign Up
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