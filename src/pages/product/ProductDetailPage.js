import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  FavoriteBorder,
  Favorite,
  Storefront as StorefrontIcon,
} from "@mui/icons-material";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import productService from "../../services/productService.js";
import { useCart } from "../../contexts/CartContext.js";
import { useFavorites } from "../../contexts/FavoritesContext.js";
import { useAuth } from "../../contexts/AuthContext.js";
import { useCategories } from "../../contexts/CategoriesContext.js";
import ProductCarousel from "../../components/ProductCarousel.js";
import {
  CardSkeleton,
  ProductDetailSkeleton,
} from "../../components/ProductsSkeletons.js";
import ProductDetailTableRow from "../../components/ProductDetailTableRow.js";
import { useMemo } from "react";

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
  const { categories } = useCategories(); // Get categories from context

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const productData = await productService.getProductBySlug(productSlug);

        if (isMounted) {
          // Batch updates where possible (React 18 does this auto, but good practice)
          setProduct(productData);
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
    <Container maxWidth="xl" sx={{ py: 8 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/products")}
        sx={{
          mb: 4,
          color: "black",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        Back to Products
      </Button>

      <Grid container spacing={8}>
        {/* Product Image */}
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              bgcolor: "#f5f5f5",
              position: "relative",
              width: "100%",
              pt: "100%", // Square aspect ratio
            }}
          >
            <Box
              component="img"
              src={product.image_url || "/placeholder.png"}
              alt={product.name}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                p: 4,
                mixBlendMode: "multiply",
              }}
            />

            {/* Favorite Button */}
            <IconButton
              onClick={handleToggleFavorite}
              sx={{
                position: "absolute",
                top: 24,
                right: 24,
                bgcolor: "transparent",
                "&:hover": {
                  bgcolor: "transparent",
                  transform: "scale(1.1)",
                },
              }}
            >
              {isFav ? (
                <Favorite sx={{ color: "black" }} />
              ) : (
                <FavoriteBorder sx={{ color: "black" }} />
              )}
            </IconButton>
          </Box>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: "sticky", top: 100 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
              <MuiLink
                component={Link}
                to="/products"
                underline="hover"
                color="inherit"
                sx={{
                  textTransform: "uppercase",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
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
                  sx={{
                    textTransform: "uppercase",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {cat.name}
                </MuiLink>
              ))}
            </Breadcrumbs>

            {/* Product Name */}
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: 900,
                textTransform: "uppercase",
                lineHeight: 0.9,
                mb: 2,
              }}
            >
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
            <Box sx={{ mb: 4 }}>
              {product.has_discount ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "error.main",
                    }}
                  >
                    ${product.final_price?.toFixed(2)}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      textDecoration: "line-through",
                      color: "text.secondary",
                    }}
                  >
                    ${product.price?.toFixed(2)}
                  </Typography>
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
                  variant="h4"
                  color="text.primary"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.5rem",
                  }}
                >
                  ${product.final_price?.toFixed(2)}
                </Typography>
              )}
            </Box>

            {/* Stock Status */}
            <Box sx={{ mb: 4 }}>
              {isInStock ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: "green",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  In Stock
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: "red",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Out of Stock
                </Typography>
              )}
            </Box>

            {/* Description */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.8 }}
            >
              {product.description}
            </Typography>

            {/* Add to Cart Section */}
            {isInStock && (
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    border: "1px solid #e0e0e0",
                    width: "fit-content",
                  }}
                >
                  <IconButton
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ px: 2, fontWeight: 700 }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={handleIncrement}
                    disabled={
                      (quantity >= product.stock && !isAlwaysInStock) ||
                      quantity >= product.max_per_buy
                    }
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => handleAddToCart()}
                  sx={{
                    bgcolor: "black",
                    color: "white",
                    py: 2,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    "&:hover": { bgcolor: "#333" },
                  }}
                >
                  Add to Cart
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 4 }} />

            {/* Description */}
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, textTransform: "uppercase", mb: 2 }}
            >
              Description
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ lineHeight: 1.8, color: "#555" }}
            >
              {product.description}
            </Typography>

            {/* Additional Info */}
            <Box sx={{ mt: 4 }}>
              {product.brand && (
                <ProductDetailTableRow
                  label={"Brand"}
                  value={product.brand.name}
                />
              )}
              {product.weight && (
                <ProductDetailTableRow
                  label={"Weight"}
                  value={`${product.weight} kg`}
                />
              )}
              {product.unit_per_package && (
                <ProductDetailTableRow
                  label={"Units per Package"}
                  value={product.unit_per_package}
                />
              )}
              {product.sku && (
                <ProductDetailTableRow label={"SKU"} value={product.sku} />
              )}
              {product.ean && (
                <ProductDetailTableRow label={"EAN"} value={product.ean} />
              )}
            </Box>
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
