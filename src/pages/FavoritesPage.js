import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Paper,
} from '@mui/material';
import {
  FavoriteBorder as FavoriteIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import { useSnackbar } from 'notistack';
import productService from '../services/productService';

/**
 * Favorites page component
 */
const FavoritesPage = () => {
  const navigate = useNavigate();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteProducts();
  }, [favorites]);

  /**
   * Load full product details for favorites
   */
  const loadFavoriteProducts = async () => {
    if (!favorites || favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Get all products and filter by favorites
      const allProductsData = await productService.getProducts({ limit: 1000 });
      
      // Handle both array and object responses
      const allProducts = Array.isArray(allProductsData) 
        ? allProductsData 
        : allProductsData.products || [];
      
      const favoriteProductIds = favorites.map(fav => fav.product_id || fav.id);
      const favoriteProducts = allProducts.filter(product => 
        favoriteProductIds.includes(product.id)
      );
      setProducts(favoriteProducts);
    } catch (error) {
      enqueueSnackbar('Failed to load favorite products', { variant: 'error' });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle add to cart
   * @param {number} productId
   * @param {number} quantity
   */
  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await addToCart(productId, quantity);
      enqueueSnackbar(`Added ${quantity} item(s) to cart`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to add to cart', { variant: 'error' });
    }
  };

  if (!isAuthenticated) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          My Favorites
        </Typography>
        <Alert severity="info">
          Please log in to view your favorites.
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/login')}
        >
          Log In
        </Button>
      </Container>
    );
  }

  if (loading || favoritesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          My Favorites
        </Typography>
        
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
              bgcolor: 'primary.light',
              mb: 3,
            }}
          >
            <FavoriteIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            No Favorites Yet
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Start building your wishlist by clicking the heart icon on products you love.
            Your favorites will appear here for easy access.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingBagIcon />}
            onClick={() => navigate('/products')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Explore Products
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        My Favorites
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {products.length} {products.length === 1 ? 'product' : 'products'} in your favorites
      </Typography>

      {/* Favorites Grid */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard
              product={product}
              onAddToCart={handleAddToCart}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FavoritesPage;
