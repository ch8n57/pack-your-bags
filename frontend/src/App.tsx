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
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <Toolbar>
        <Typography variant="h5" component="div" sx={{ 
          flexGrow: 1, 
          fontWeight: 600,
          color: 'primary.main'
        }}>
          <Link to="/" style={{ 
            color: 'inherit', 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            🌎 Pack Your Bags
          </Link>
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          alignItems: 'center'
        }}>
          {isAuthenticated ? (
            <>
              <Button 
                color="primary" 
                component={Link} 
                to="/my-bookings"
                startIcon={<span>📅</span>}
                sx={{ fontWeight: 500 }}
              >
                My Bookings
              </Button>
              {user?.role === 'admin' && (
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/admin"
                  startIcon={<span>⚙️</span>}
                  sx={{ fontWeight: 500 }}
                >
                  Admin Dashboard
                </Button>
              )}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'grey.50'
              }}>
                <span>👤</span>
                <Typography variant="body2">{user?.firstName}</Typography>
              </Box>
              <Button 
                color="error" 
                variant="outlined"
                onClick={logout}
                size="small"
                startIcon={<span>🚪</span>}
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
                sx={{ fontWeight: 500 }}
              >
                Login
              </Button>
              <Button 
                color="primary" 
                component={Link} 
                to="/register"
                variant="contained"
                sx={{ fontWeight: 500 }}
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
  <Router>
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Container sx={{ flex: 1, py: 4 }}>
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
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Pack Your Bags. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  </Router>
);

export default App;