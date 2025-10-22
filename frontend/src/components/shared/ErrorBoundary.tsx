import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '80vh',
              textAlign: 'center',
              gap: 2
            }}
          >
            <Typography variant="h4" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry for the inconvenience. Please try refreshing the page.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            {import.meta.env.DEV && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="error" sx={{ wordBreak: 'break-word' }}>
                  {this.state.error?.toString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}