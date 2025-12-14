import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Link, Button } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * ScrollLink component that navigates and scrolls to top
 * Implements the Strategy pattern for navigation with scroll behavior
 * 
 * @param {string} to - Route to navigate to
 * @param {string} variant - 'link' or 'button'
 * @param {ReactNode} children - Link/button content
 * @param {Function} onClick - Optional additional click handler
 * @param {Object} props - Additional props for Link or Button
 */
const ScrollLink = ({ 
  to, 
  variant = 'link', 
  children, 
  onClick, 
  ...props 
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    
    // Navigate and scroll to top
    navigate(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (variant === 'button') {
    return (
      <Button onClick={handleClick} {...props}>
        {children}
      </Button>
    );
  }

  return (
    <Link
      component="button"
      onClick={handleClick}
      sx={{ textDecoration: 'none', cursor: 'pointer' }}
      {...props}
    >
      {children}
    </Link>
  );
};

ScrollLink.propTypes = {
  to: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['link', 'button']),
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

export default ScrollLink;
