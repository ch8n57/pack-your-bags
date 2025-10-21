import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
} from '@mui/material';
import { packages } from '../../api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Toast } from '../shared/Toast';
import { useNavigate } from 'react-router-dom';

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

export const PackageList = () => {
  const navigate = useNavigate();
  const [travelPackages, setTravelPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
    fetchPackages();
  }, []);

  const parseResponse = (data: any): TravelPackage => ({
    ...data,
    price: Number(data.price),
    duration: Number(data.duration),
    maxTravelers: Number(data.maxTravelers)
  });

  const fetchPackages = async () => {
    try {
      const response = await packages.getAll();
      setTravelPackages(response.data.map(parseResponse));
    } catch (error) {
      setToast({
        open: true,
        message: 'Error fetching packages',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await packages.search({ destination: searchTerm });
      setTravelPackages(response.data);
    } catch (error) {
      setToast({
        open: true,
        message: 'Error searching packages',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Box sx={{ 
        my: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -32,
          left: -24,
          right: -24,
          height: 300,
          background: 'linear-gradient(135deg, #1976d2, #64b5f6)',
          zIndex: -1,
          borderRadius: '0 0 50% 50%',
        }
      }}>
        <Box sx={{ 
          textAlign: 'center', 
          color: 'white',
          pt: 4,
          pb: 8
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Discover Your Next Adventure
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Explore our handpicked travel packages and create unforgettable memories
          </Typography>
        </Box>
        <Box sx={{ 
          mb: 4, 
          mx: 'auto', 
          maxWidth: 600,
          transform: 'translateY(-50%)',
        }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              gap: 2,
              borderRadius: 3,
            }}
          >
            <TextField
              fullWidth
              label="Search by destination"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <span style={{ marginRight: 8 }}>🔍</span>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <Button 
              variant="contained" 
              onClick={handleSearch}
              sx={{ 
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Search
            </Button>
          </Paper>
        </Box>
        <Grid container spacing={4}>
          {travelPackages.map((pack) => (
            <Grid item key={pack.id} xs={12} sm={6} md={4}>
              <Card
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={`/images/packages/${pack.destination}${pack.destination === 'Taj Mahal' ? '.avif' : pack.destination === 'Heads' ? '.jpeg' : pack.destination === 'Temple' ? '.jpeg' : '.jpg'}`}
                    alt={pack.destination}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/packages/default.jpg';
                    }}
                    sx={{ 
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      ${Number(pack.price).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom variant="h5" component="h2" fontWeight="bold">
                      {pack.name}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1,
                        mb: 2
                      }}
                    >
                      <span>📍</span> {pack.destination}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    paragraph 
                    sx={{ 
                      mb: 3,
                      color: 'text.secondary',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {pack.description}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 3,
                    color: 'text.secondary'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <span>⏱️</span>
                      <Typography variant="body2">
                        {pack.duration} days
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <span>👥</span>
                      <Typography variant="body2">
                        Up to {pack.maxTravelers} people
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => navigate(`/packages/${pack.id}`)}
                    sx={{ 
                      mt: 'auto',
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 'none',
                      }
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
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