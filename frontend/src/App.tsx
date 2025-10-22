import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { PackageList } from './components/packages/PackageList';
import { PackageDetail } from './components/packages/PackageDetail';
import { MyBookings } from './components/bookings/MyBookings';
import { AdminDashboard } from './components/admin/AdminDashboard';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <AppBar position="static" sx={{
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}>
      <Toolbar sx={{ py: 1 }}>
        <Typography variant="h5" component="div" sx={{
          flexGrow: 1,
          fontWeight: 700,
          color: 'primary.main',
          letterSpacing: '-0.02em'
        }}>
          <Link to="/" style={{
            color: 'inherit',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'opacity 0.2s ease'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🌎</span>
            Pack Your Bags
          </Link>
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {isAuthenticated ? (
            <>
              <Button
                color="primary"
                component={Link}
                to="/my-bookings"
                sx={{
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                My Bookings
              </Button>
              {user?.role === 'admin' && (
                <Button
                  color="primary"
                  component={Link}
                  to="/admin"
                  sx={{
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Admin Dashboard
                </Button>
              )}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.primary',
                px: 2,
                py: 0.75,
                borderRadius: 2,
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                border: '1px solid rgba(25, 118, 210, 0.2)'
              }}>
                <span>👤</span>
                <Typography variant="body2">{user?.firstName}</Typography>
              </Box>
              <Button
                color="error"
                variant="outlined"
                onClick={logout}
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 2,
                  transition: 'all 0.2s ease'
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="primary"
                component={Link}
                to="/login"
                variant="outlined"
                sx={{
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                Login
              </Button>
              <Button
                color="primary"
                component={Link}
                to="/register"
                variant="contained"
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const App = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Container maxWidth="lg" sx={{ flex: 1, py: 4, animation: 'fadeIn 0.5s ease' }}>
        <Routes>
          <Route path="/" element={<PackageList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Container>
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          mt: 'auto',
          backgroundColor: '#1a1a1a',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }} align="center">
            © {new Date().getFullYear()} Pack Your Bags. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  </Router>
);

export default App;