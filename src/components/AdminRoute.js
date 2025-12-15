import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

/**
 * Admin-only route component - redirects if not authenticated or not admin
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if admin
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_superuser) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'grey.50', p: 3 }}
      >
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            maxWidth: 500,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'error.light',
              mb: 3,
            }}
          >
            <LockOutlined sx={{ fontSize: 40, color: 'error.main' }} />
          </Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have permission to access this page. Admin privileges are required.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminRoute;
