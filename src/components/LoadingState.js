import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Reusable loading state component
 * Provides consistent loading UI across the application
 * 
 * @param {string} message - Loading message
 * @param {string} size - Size of the spinner (small, medium, large)
 * @param {boolean} fullHeight - Whether to use full viewport height
 */
const LoadingState = ({ 
  message = 'Loading...', 
  size = 'medium',
  fullHeight = false,
}) => {
  const sizeMap = {
    small: 30,
    medium: 40,
    large: 60,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullHeight ? '70vh' : 200,
        gap: 2,
      }}
    >
      <CircularProgress size={sizeMap[size]} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

LoadingState.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullHeight: PropTypes.bool,
};

export default LoadingState;
