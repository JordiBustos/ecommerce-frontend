import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import ProductCard from './ProductCard';

/**
 * Product carousel component
 * @param {Object} props
 * @param {Array} props.products - Array of products to display
 * @param {Function} [props.onAddToCart] - Callback when add to cart is clicked
 */
const ProductCarousel = ({ products, onAddToCart }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const itemsPerView = 4;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (!products || products.length === 0) {
    return null;
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <Box sx={{ position: 'relative', px: 6 }}>
      {/* Previous Button */}
      <IconButton
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'background.paper' },
          boxShadow: 2,
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      {/* Products */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflow: 'hidden',
          padding: '1rem',
        }}
      >
        {visibleProducts.map((product) => (
          <Box
            key={product.id}
            sx={{
              minWidth: 250,
              flex: 1,
            }}
          >
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              compact
            />
          </Box>
        ))}
      </Box>

      {/* Next Button */}
      <IconButton
        onClick={handleNext}
        disabled={currentIndex >= maxIndex}
        sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'background.paper' },
          boxShadow: 2,
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

ProductCarousel.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number,
      image_url: PropTypes.string,
      stock: PropTypes.number,
    })
  ).isRequired,
  onAddToCart: PropTypes.func,
};

export default ProductCarousel;
