import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  Alert,
  Breadcrumbs,
  Skeleton,
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
import productService from "../../services/productService.js";
import { useCart } from "../../contexts/CartContext.js";
import { useFavorites } from "../../contexts/FavoritesContext.js";
import { useAuth } from "../../contexts/AuthContext.js";
import ProductCarousel from "../../components/ProductCarousel.js";
import {
  CardSkeleton,
  ProductDetailSkeleton,
} from "../../components/ProductsSkeletons.js";
import { useMemo } from "react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Product detail page component
 */
const ProductDetailPage = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [productData, categoriesData] = await Promise.all([
          productService.getProductBySlug(productSlug),
          productService.getCategories(),
        ]);

        if (isMounted) {
          // Batch updates where possible (React 18 does this auto, but good practice)
          setProduct(productData);
          setCategories(categoriesData);
          // Reset quantity on new product load
          setQuantity(1);
        }
      } catch (error) {
        if (isMounted) {
          enqueueSnackbar("Failed to load product details", {
            variant: "error",
          });
          navigate("/products");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [productSlug, navigate, enqueueSnackbar]);

  const isFav = useMemo(() => {
    if (!product || !isAuthenticated) return false;
    return isFavorite(product.id);
  }, [product, isAuthenticated, isFavorite]);

  const categoryPath = useMemo(() => {
    if (!product?.category_id || categories.length === 0) return [];

    const path = [];
    // Create Map once per calculation for O(1) lookup
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    let currentId = product.category_id;
    while (currentId) {
      const category = categoryMap.get(currentId);
      if (!category) break;
      path.unshift(category);
      currentId = category.parent_id;
    }
    return path;
  }, [product?.category_id, categories]);

  const productBrandId = product?.brand_id;
  const productId = product?.id;

  useEffect(() => {
    if (!productId || !productBrandId || categoryPath.length === 0) return;

    let isMounted = true;

    const fetchSimilar = async () => {
      setLoadingSimilar(true);
      try {
        const categoryIds = categoryPath.map((cat) => cat.id);
        const queryParams = {
          limit: 12,
          skip: 0,
          brands_id: [productBrandId],
          categories_id: categoryIds.join(","),
        };

        const data = await productService.getProducts(queryParams);

        if (isMounted) {
          const filteredProducts = data.products.filter(
            (p) => p.id !== productId
          );
          setSimilarProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Failed to load similar products", error);
      } finally {
        if (isMounted) setLoadingSimilar(false);
      }
    };

    fetchSimilar();

    return () => {
      isMounted = false;
    };
  }, [productId, productBrandId, categoryPath]);

  const handleDecrement = useCallback(() => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }, []);

  const handleIncrement = useCallback(() => {
    if (!product) return;

    if (product.max_per_buy && quantity >= product.max_per_buy) {
      enqueueSnackbar(`Maximum ${product.max_per_buy} per purchase`, {
        variant: "warning",
      });
      return;
    }

    const isAlwaysInStock = product.is_always_in_stock;
    if (!isAlwaysInStock && quantity >= product.stock) {
      enqueueSnackbar("Maximum available stock reached", {
        variant: "warning",
      });
      return;
    }

    setQuantity((prev) => prev + 1);
  }, [product, quantity, enqueueSnackbar]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      enqueueSnackbar("Product added to cart", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to add to cart", { variant: "error" });
    }
  }, [product, quantity, addToCart, enqueueSnackbar]);

  const handleToggleFavorite = useCallback(async () => {
    if (!isAuthenticated) return;
    if (!product) return;

    try {
      await toggleFavorite(product.id);
      enqueueSnackbar("Favorites updated", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to update favorites", { variant: "error" });
    }
  }, [isAuthenticated, product, toggleFavorite, enqueueSnackbar]);

  if (loading) {
    return <ProductDetailSkeleton />;
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
        {categoryPath.map((cat) => (
          <MuiLink
            key={cat.id}
            component={Link}
            to={`/products?category=${cat.id}`}
            underline="hover"
            color="inherit"
          >
            {cat.name}
          </MuiLink>
        ))}
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
            <Box sx={{ mb: 1 }}>
              {product.has_discount ? (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="h5"
                      color="error.main"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.5rem",
                      }}
                    >
                      ${product.final_price?.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        textDecoration: "line-through",
                        color: "text.secondary",
                        fontSize: "1rem",
                      }}
                    >
                      ${product.price?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: "error.main",
                        color: "white",
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      {product.savings_percent?.toFixed(0)}% OFF
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Save ${product.savings?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography
                  variant="h5"
                  color="text.primary"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.5rem",
                  }}
                >
                  $
                  {product.final_price?.toFixed(2) || product.price?.toFixed(2)}
                </Typography>
              )}
            </Box>

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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
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
                    <IconButton
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                    >
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

            {/* TODO: Make this value configurable -- Shipping Info */}
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <QrCodeIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          SKU:
                        </Typography>
                        {loading ? (
                          <Skeleton variant="text" width={80} />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {product.sku}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* EAN */}
                  {product.ean && (
                    <Grid item xs={12}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
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

      {/* Similar Products */}
      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
        >
          Similar Products
        </Typography>
        {/* TODO: Mostrar ambos skeletons, fixear bug de loadings */}
        {loadingSimilar ? (
          <Box sx={{ px: 6 }}>
            <Box sx={{ display: "flex", gap: 2, overflow: "hidden", p: 1 }}>
              {[1, 2, 3].map((index) => (
                <Box key={index} sx={{ minWidth: 250, flex: 1 }}>
                  <CardSkeleton index={index} />
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <ProductCarousel products={similarProducts} compact={false} />
        )}
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
