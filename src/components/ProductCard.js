import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { useFavorites } from "../contexts/FavoritesContext";
import { useAuth } from "../contexts/AuthContext";
import { useSnackbar } from "notistack";

/**
 * Unified Product Card Component
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {Function} [props.onAddToCart] - Callback when add to cart is clicked
 * @param {boolean} [props.compact] - Compact mode for carousel
 */
const ProductCard = ({ product, onAddToCart, compact = false }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const { isFavorite, toggleFavorite, favorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const isAlwaysInStock = product.is_always_in_stock || false;
  const isInStock = isAlwaysInStock || (product.stock && product.stock > 0);
  const maxQuantity = product.max_per_buy;

  useEffect(() => {
    setIsFav(isAuthenticated ? isFavorite(product.id) : false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites, isAuthenticated, product.id]);

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity >= maxQuantity) {
      enqueueSnackbar(`Maximum ${maxQuantity} per purchase`, {
        variant: "warning",
      });
      return;
    }
    if (!isAlwaysInStock && quantity >= product.stock) {
      enqueueSnackbar("Maximum available stock reached", {
        variant: "warning",
      });
      return;
    }
    setQuantity(quantity + 1);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id, quantity);
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`);
    window.scrollTo(0, 0);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      enqueueSnackbar("Please log in to favorite products", {
        variant: "info",
      });
      return;
    }

    const wasAlreadyFavorite = isFav;

    try {
      await toggleFavorite(product.id);
      setTimeout(() => {
        enqueueSnackbar(
          wasAlreadyFavorite ? "Removed from favorites" : "Added to favorites",
          { variant: "success" }
        );
      }, 0);
    } catch (error) {
      enqueueSnackbar("Failed to update favorites", { variant: "error" });
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: 0,
        boxShadow: "none",
        cursor: "pointer",
        bgcolor: "transparent",
        border: "1px solid transparent",
        transition: "border-color 0.2s",
        "&:hover": {
          borderColor: "#e0e0e0",
        },
      }}
    >
      {/* Favorite Button */}
      <IconButton
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 1,
          bgcolor: "transparent",
          color: "black",
          "&:hover": {
            bgcolor: "transparent",
            transform: "scale(1.1)",
          },
        }}
        onClick={handleToggleFavorite}
      >
        {isFav ? (
          <Favorite sx={{ color: "black" }} />
        ) : (
          <FavoriteBorder sx={{ color: "black" }} />
        )}
      </IconButton>

      {/* Product Image */}
      <Box sx={{ position: "relative", pt: "100%", bgcolor: "#f5f5f5", mb: 2 }}>
        <CardMedia
          component="img"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            p: 2,
            mixBlendMode: "multiply",
          }}
          image={product.image_url || "/placeholder.png"}
          alt={product.name}
        />
      </Box>

      {/* Product Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 1,
          pt: 0,
        }}
      >
        {/* Product Name */}
        <Typography
          variant="body1"
          component="h3"
          sx={{
            fontWeight: 400,
            mb: 0.5,
            fontSize: "0.9rem",
            lineHeight: 1.4,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </Typography>

        {/* Product Description */}
        {!compact && product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              textTransform: "capitalize",
            }}
          >
            {product.description}
          </Typography>
        )}

        {/* Price */}
        <Box sx={{ mt: "auto" }}>
          {product.has_discount ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: "error.main",
                }}
              >
                ${product.final_price?.toFixed(2)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  textDecoration: "line-through",
                  color: "text.secondary",
                }}
              >
                ${product.price?.toFixed(2)}
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="body1"
              color="text.primary"
              sx={{
                fontWeight: 700,
                fontSize: compact ? "1.3rem" : "1.5rem",
              }}
            >
              ${product.final_price?.toFixed(2)}
            </Typography>
          )}
        </Box>

        {/* Stock Status */}
        <Typography
          variant="body2"
          sx={{
            color: isInStock ? "success.main" : "error.main",
            fontWeight: 500,
            mb: 0.5,
          }}
        >
          {isInStock
            ? isAlwaysInStock
              ? "In stock"
              : `Stock: ${product.stock}`
            : "Out of stock"}
        </Typography>

        {/* Max Quantity */}
        {isInStock && !compact && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Max. per purchase: {maxQuantity}
          </Typography>
        )}

        {/* Quantity Selector and Add Button */}
        {isInStock && onAddToCart && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: "auto",
            }}
          >
            {/* Quantity Controls */}
            {!compact && (
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 1,
                  bgcolor: "grey.50",
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDecrement();
                  }}
                  disabled={quantity <= 1}
                  sx={{ color: "text.secondary" }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography
                  sx={{
                    px: 2,
                    minWidth: 40,
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncrement();
                  }}
                  disabled={
                    quantity >= maxQuantity ||
                    (!isAlwaysInStock && quantity >= product.stock)
                  }
                  sx={{ color: "text.secondary" }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Add to Cart Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddToCart}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                fontWeight: 600,
                textTransform: "uppercase",
                py: 0.5,
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              ADD TO CART
            </Button>
          </Box>
        )}

        {/* Out of Stock Message */}
        {!isInStock && (
          <Button
            variant="contained"
            fullWidth
            disabled
            sx={{
              mt: "auto",
              py: 1.2,
            }}
          >
            Agotado
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    image_url: PropTypes.string,
    stock: PropTypes.number,
    max_quantity: PropTypes.number,
    is_always_in_stock: PropTypes.bool,
  }).isRequired,
  onAddToCart: PropTypes.func,
  compact: PropTypes.bool,
};

export default ProductCard;
