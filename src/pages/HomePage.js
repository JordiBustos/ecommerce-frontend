import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Favorite,
  LocalShipping,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import ProductCarousel from "../components/ProductCarousel";
import productService from "../services/productService";
import { useSnackbar } from "notistack";

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
      enqueueSnackbar("Failed to load best selling products", {
        variant: "error",
      });
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
  const handleAddToCart = async (productId, quantity) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(productId, quantity);
      enqueueSnackbar("Added to cart", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to add to cart", { variant: "error" });
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
          bgcolor: "black",
          color: "white",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Abstract background shape or image placeholder */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.3,
            background: "linear-gradient(45deg, #333 30%, #000 90%)",
            zIndex: 0,
          }}
        />

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container>
            <Grid item xs={12} md={8} lg={6}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 900,
                  textTransform: "uppercase",
                  fontSize: { xs: "3rem", md: "5rem" },
                  lineHeight: 0.9,
                  mb: 4,
                }}
              >
                Impossible is Nothing
              </Typography>
              <Typography
                variant="h5"
                sx={{ mb: 6, fontWeight: 300, maxWidth: "600px" }}
              >
                Discover the latest collection of premium gear designed for
                performance and style.
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/products")}
                  sx={{
                    bgcolor: "white",
                    color: "black",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    "&:hover": { bgcolor: "#f0f0f0" },
                  }}
                >
                  Shop Now
                </Button>
                {!isAuthenticated && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/register")}
                    sx={{
                      borderColor: "white",
                      color: "white",
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Join Us
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Best Sellers Section */}
      {bestSelling.length > 0 && (
        <Box sx={{ py: 10 }}>
          <Container maxWidth="xl">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 6,
              }}
            >
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, textTransform: "uppercase" }}
              >
                Best Sellers
              </Typography>
              <Button
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/products")}
                sx={{ color: "black", fontWeight: 700 }}
              >
                View All
              </Button>
            </Box>

            <ProductCarousel
              products={bestSelling}
              onAddToCart={isAuthenticated ? handleAddToCart : null}
              compact={false}
            />
          </Container>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress color="inherit" />
        </Box>
      )}

      {/* Features Section - Minimalist */}
      <Box sx={{ bgcolor: "#f5f5f5", py: 10 }}>
        <Container maxWidth="xl">
          <Grid container spacing={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ mb: 2, color: "black" }}>{feature.icon}</Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 700, textTransform: "uppercase" }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{ bgcolor: "black", color: "white", py: 10, textAlign: "center" }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 900, textTransform: "uppercase" }}
          >
            Join the Club
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, fontWeight: 300, color: "#ccc" }}
          >
            Get exclusive access to new drops and special offers.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate(isAuthenticated ? "/products" : "/register");
            }}
            sx={{
              bgcolor: "white",
              color: "black",
              px: 6,
              py: 1.5,
              "&:hover": { bgcolor: "#f0f0f0" },
            }}
          >
            {isAuthenticated ? "Start Shopping" : "Sign Up for Free"}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
