import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * Reusable error state component
 * Provides consistent error UI across the application
 * 
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {Function} onRetry - Optional retry handler
 * @param {string} retryLabel - Retry button label
 */
const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading the data. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        py: 8,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: 'error.light',
          mb: 3,
        }}
      >
        <ErrorIcon sx={{ fontSize: 50, color: 'error.main' }} />
      </Box>
      
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ mb: 3, maxWidth: 500 }}
      >
        {message}
      </Typography>
      
      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          onClick={onRetry}
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          {retryLabel}
        </Button>
      )}
    </Box>
  );
};

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  retryLabel: PropTypes.string,
};

export default ErrorState;
