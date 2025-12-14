import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Favorite, LocalShipping } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import ProductCarousel from "../components/ProductCarousel";
import productService from "../services/productService";
import { useSnackbar } from 'notistack';

/**
 * Home page component
 */
const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { enqueueSnackbar } = useSnackbar();
  const [bestSelling, setBestSelling] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load best selling products
   */
  const loadBestSelling = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getBestSelling();
      setBestSelling(data);
    } catch (error) {
      enqueueSnackbar("Failed to load best selling products", { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadBestSelling();
  }, [loadBestSelling]);

  /**
   * Handle add to cart from carousel
   * @param {number} productId
   */
  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(productId, 1);
      enqueueSnackbar('Added to cart', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar("Failed to add to cart", { variant: 'error' });
    }
  };

  const features = [
    {
      icon: <ShoppingCart sx={{ fontSize: 60 }} />,
      title: "Easy Shopping",
      description: "Browse and purchase products with just a few clicks",
    },
    {
      icon: <Favorite sx={{ fontSize: 60 }} />,
      title: "Save Favorites",
      description: "Keep track of products you love for later",
    },
    {
      icon: <LocalShipping sx={{ fontSize: 60 }} />,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to your doorstep",
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Our Store
          </Typography>
          <Typography variant="h5" paragraph>
            Discover amazing products at great prices
          </Typography>
          <Box sx={{ mt: 4 }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate("/products")}
              >
                Shop Now
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate("/register")}
                  sx={{ mr: 2 }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </>
            )}
          </Box>
        </Container>

        {bestSelling.length > 0 && (
          <Box sx={{ bgcolor: "grey.50", py: 8 }}>
            <Container maxWidth="lg">
              <Typography variant="h3" align="center" gutterBottom color={"textPrimary"}>
                Most Selled Products
              </Typography>
              <Box sx={{ mt: 4 }}>
                <ProductCarousel
                  products={bestSelling}
                  onAddToCart={isAuthenticated ? handleAddToCart : null}
                />
              </Box>
            </Container>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Features Section */}
        <Container sx={{ py: 8 }}>
          <Typography variant="h3" align="center" gutterBottom>
            Why Shop With Us
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: 3,
                  }}
                >
                  <Box sx={{ color: "primary.main", mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* CTA Section */}
        <Box sx={{ bgcolor: "background.paper", py: 6 }}>
          <Container maxWidth="md" sx={{ textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              Ready to start shopping?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Join thousands of satisfied customers today
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(isAuthenticated ? "/products" : "/register");
              }}
            >
              {isAuthenticated ? "Browse Products" : "Sign Up Now"}
            </Button>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
