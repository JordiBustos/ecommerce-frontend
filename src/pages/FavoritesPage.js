import { useEffect, useState, useCallback } from "react";
import { Container, Grid, Typography, Alert, Button } from "@mui/material";
import { FavoriteBorder as FavoriteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import ProductCard from "../components/ProductCard";
import { useSnackbar } from "notistack";
import productService from "../services/productService";
import { EmptyState, LoadingState } from "../components";

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

  /**
   * Load full product details for favorites
   */
  const loadFavoriteProducts = useCallback(async () => {
    if (!favorites || favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const allProductsData = await productService.getProducts({ limit: 1000 });

      const allProducts = Array.isArray(allProductsData)
        ? allProductsData
        : allProductsData.products || [];

      const favoriteProductIds = favorites.map(
        (fav) => fav.product_id || fav.id
      );
      const favoriteProducts = allProducts.filter((product) =>
        favoriteProductIds.includes(product.id)
      );
      setProducts(favoriteProducts);
    } catch (error) {
      enqueueSnackbar("Failed to load favorite products", { variant: "error" });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [favorites, enqueueSnackbar]);

  useEffect(() => {
    loadFavoriteProducts();
  }, [loadFavoriteProducts]);

  /**
   * Handle add to cart
   * @param {number} productId
   * @param {number} quantity
   */
  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await addToCart(productId, quantity);
      enqueueSnackbar(`Added ${quantity} item(s) to cart`, {
        variant: "success",
      });
    } catch (err) {
      enqueueSnackbar("Failed to add to cart", { variant: "error" });
    }
  };

  if (!isAuthenticated) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          My Favorites
        </Typography>
        <Alert severity="info">Please log in to view your favorites.</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/login")}
        >
          Log In
        </Button>
      </Container>
    );
  }

  if (loading || favoritesLoading) {
    return <LoadingState message="Loading favorites..." fullHeight />;
  }

  if (products.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          My Favorites
        </Typography>

        <EmptyState
          icon={FavoriteIcon}
          iconColor="primary.main"
          iconBgColor="primary.light"
          title="No Favorites Yet"
          description="Start building your wishlist by clicking the heart icon on products you love. Your favorites will appear here for easy access."
          actionLabel="Explore Products"
          onAction={() => navigate("/products")}
        />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        My Favorites
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {products.length} {products.length === 1 ? "product" : "products"} in
        your favorites
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard product={product} onAddToCart={handleAddToCart} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FavoritesPage;
