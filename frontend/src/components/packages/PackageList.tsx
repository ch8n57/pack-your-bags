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
          height: 320,
          background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)',
          zIndex: -1,
          borderRadius: '0 0 50% 50%',
          boxShadow: '0 10px 40px rgba(25, 118, 210, 0.2)'
        }
      }}>
        <Box sx={{
          textAlign: 'center',
          color: 'white',
          pt: 5,
          pb: 10,
          animation: 'fadeIn 0.8s ease'
        }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              textShadow: '0 4px 20px rgba(0,0,0,0.15)',
              letterSpacing: '-0.02em',
              mb: 2
            }}
          >
            Discover Your Next Adventure
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.95, fontWeight: 400, fontSize: '1.15rem' }}>
            Explore our handpicked travel packages and create unforgettable memories
          </Typography>
        </Box>
        <Box sx={{
          mb: 4,
          mx: 'auto',
          maxWidth: 650,
          transform: 'translateY(-50%)',
          animation: 'slideInUp 0.6s ease 0.2s backwards'
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              gap: 2,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}
          >
            <TextField
              fullWidth
              placeholder="Where do you want to go?"
              label="Search destinations"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <span style={{ marginRight: 8, fontSize: '1.2rem' }}>🔍</span>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
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
              variant="contained"
              onClick={handleSearch}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: 'none',
                minWidth: 120,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.35)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Search
            </Button>
          </Paper>
        </Box>
        <Grid container spacing={4} sx={{ animation: 'fadeIn 0.8s ease 0.4s backwards' }}>
          {travelPackages.map((pack) => (
            <Grid item key={pack.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                    '& .package-image': {
                      transform: 'scale(1.08)'
                    }
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={`/images/packages/${pack.destination}${pack.destination === 'Taj Mahal' ? '.avif' : pack.destination === 'Heads' ? '.jpeg' : pack.destination === 'Temple' ? '.jpeg' : '.jpg'}`}
                    alt={pack.destination}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/packages/default.jpg';
                    }}
                    className="package-image"
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      px: 2.5,
                      py: 1,
                      borderRadius: 3,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      ${Number(pack.price).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography gutterBottom variant="h5" component="h2" fontWeight="700" sx={{ letterSpacing: '-0.01em', mb: 1 }}>
                      {pack.name}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        fontWeight: 500
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
                      lineHeight: 1.6
                    }}
                  >
                    {pack.description}
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    gap: 3,
                    mb: 3,
                    color: 'text.secondary',
                    pb: 3,
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
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
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderRadius: 2,
                      boxShadow: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        transform: 'translateY(-2px)'
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