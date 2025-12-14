import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Paper } from '@mui/material';

/**
 * Reusable EmptyState component for consistent empty state UI
 * Follows the Composite pattern for flexible composition
 */
const EmptyState = ({
  icon: Icon,
  iconColor = 'primary.main',
  title,
  description,
  actionLabel,
  onAction,
  iconBgColor,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 8,
        py: 8,
        px: 4,
        textAlign: 'center',
        bgcolor: 'grey.50',
        borderRadius: 3,
        border: '2px dashed',
        borderColor: 'grey.300',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: iconBgColor || 'primary.light',
          mb: 3,
        }}
      >
        <Icon sx={{ fontSize: 60, color: iconColor }} />
      </Box>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          size="large"
          onClick={onAction}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string,
  iconBgColor: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
};

export default EmptyState;
