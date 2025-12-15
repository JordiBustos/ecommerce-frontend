import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  FavoriteBorder,
  Favorite,
  LocalShipping as ShippingIcon,
  Verified as VerifiedIcon,
  Inventory as InventoryIcon,
  Scale as ScaleIcon,
  QrCode2 as QrCodeIcon,
  Category as CategoryIcon,
  Storefront as StorefrontIcon,
} from "@mui/icons-material";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import productService from "../services/productService";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * Product detail page component
 */
const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (product && isAuthenticated) {
      setIsFav(isFavorite(product.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isAuthenticated]);

  /**
   * Load product details
   */
  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      enqueueSnackbar("Failed to load product details", { variant: "error" });
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle quantity change
   */
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (product.max_per_buy && quantity >= product.max_per_buy) {
      enqueueSnackbar(`Maximum ${product.max_per_buy} per purchase`, {
        variant: "warning",
      });
      return;
    }
    if (!product.is_always_in_stock && quantity >= product.stock) {
      enqueueSnackbar("Maximum available stock reached", {
        variant: "warning",
      });
      return;
    }
    setQuantity(quantity + 1);
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      enqueueSnackbar("Product added to cart", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to add to cart", { variant: "error" });
    }
  };

  /**
   * Handle toggle favorite
   */
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      enqueueSnackbar("Please log in to favorite products", {
        variant: "info",
      });
      return;
    }

    try {
      await toggleFavorite(product.id);
      setIsFav(!isFav);
      enqueueSnackbar(
        isFav ? "Removed from favorites" : "Added to favorites",
        { variant: "success" }
      );
    } catch (error) {
      enqueueSnackbar("Failed to update favorites", { variant: "error" });
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return null;
  }

  const isAlwaysInStock = product.is_always_in_stock || false;
  const isInStock = isAlwaysInStock || (product.stock && product.stock > 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/products")}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }} aria-label="breadcrumb">
        <MuiLink
          component={Link}
          to="/products"
          underline="hover"
          color="inherit"
        >
          Products
        </MuiLink>
        {product.category && (
          <MuiLink
            component={Link}
            to={`/products?category=${product.category.id}`}
            underline="hover"
            color="inherit"
          >
            {product.category.name}
          </MuiLink>
        )}
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              component="img"
              src={product.image_url || "/placeholder.png"}
              alt={product.name}
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: 500,
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
            
            {/* Stock Badge */}
            <Chip
              icon={isInStock ? <VerifiedIcon /> : <InventoryIcon />}
              label={
                isAlwaysInStock
                  ? "Always in Stock"
                  : isInStock
                  ? `${product.stock} in stock`
                  : "Out of Stock"
              }
              color={isInStock ? "success" : "error"}
              sx={{
                position: "absolute",
                top: 24,
                left: 24,
                fontWeight: 600,
              }}
            />

            {/* Favorite Button */}
            <IconButton
              onClick={handleToggleFavorite}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                bgcolor: "white",
                boxShadow: 2,
                "&:hover": {
                  bgcolor: "white",
                  transform: "scale(1.1)",
                },
              }}
            >
              {isFav ? (
                <Favorite sx={{ color: "error.main" }} />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
          </Paper>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Product Name */}
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              {product.name}
            </Typography>

            {/* Brand */}
            {product.brand && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <StorefrontIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="h6" color="text.secondary">
                  {product.brand.name}
                </Typography>
              </Box>
            )}

            {/* Price */}
            <Typography
              variant="h4"
              color="primary"
              sx={{ fontWeight: 700, mb: 3 }}
            >
              ${product.price.toFixed(2)}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Description */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.8 }}
            >
              {product.description}
            </Typography>

            {/* Quantity Selector */}
            {isInStock && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Quantity:
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      border: "2px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <IconButton onClick={handleDecrement} disabled={quantity <= 1}>
                      <RemoveIcon />
                    </IconButton>
                    <Typography
                      sx={{
                        px: 3,
                        fontWeight: 600,
                        fontSize: "1.2rem",
                      }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      onClick={handleIncrement}
                      disabled={
                        (!isAlwaysInStock && quantity >= product.stock) ||
                        (product.max_per_buy && quantity >= product.max_per_buy)
                      }
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  {product.max_per_buy && (
                    <Typography variant="caption" color="text.secondary">
                      Max {product.max_per_buy} per order
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* Add to Cart Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleAddToCart}
              disabled={!isInStock}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
                mb: 3,
              }}
            >
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </Button>

            {/* Shipping Info */}
            <Alert
              icon={<ShippingIcon />}
              severity="info"
              sx={{ mb: 3, borderRadius: 2 }}
            >
              Free shipping on orders over $50
            </Alert>

            {/* Product Specifications */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Product Specifications
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {/* SKU */}
                  {product.sku && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <QrCodeIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          SKU:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.sku}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* EAN */}
                  {product.ean && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <QrCodeIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          EAN:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.ean}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Weight */}
                  {product.weight && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ScaleIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Weight:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.weight} kg
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Units per Package */}
                  {product.units_per_package && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <InventoryIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Units per Package:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.units_per_package}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Category */}
                  {product.category && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CategoryIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Category:
                        </Typography>
                        <Chip
                          label={product.category.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                          component={Link}
                          to={`/products?category=${product.category.id}`}
                          clickable
                        />
                      </Box>
                    </Grid>
                  )}

                  {/* Created Date */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Added on:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(product.created_at)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Brand Details */}
            {product.brand && product.brand.description && (
              <Card variant="outlined" sx={{ borderRadius: 2, mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    {product.brand.logo_url && (
                      <Box
                        component="img"
                        src={product.brand.logo_url}
                        alt={product.brand.name}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: "contain",
                        }}
                      />
                    )}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        About {product.brand.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {product.brand.description}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;
