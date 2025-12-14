import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
  }, [favorites, isAuthenticated, product.id, isFavorite]);

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

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id, quantity);
    }
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
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: 2,
        boxShadow: 2,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      {/* Favorite Button */}
      <IconButton
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          bgcolor: "white",
          boxShadow: 1,
          "&:hover": {
            bgcolor: "white",
          },
        }}
        onClick={handleToggleFavorite}
      >
        {isFav ? <Favorite sx={{ color: "error.main" }} /> : <FavoriteBorder />}
      </IconButton>

      {/* Product Image */}
      <CardMedia
        component="img"
        sx={{
          height: compact ? 180 : 240,
          objectFit: "cover",
          bgcolor: "grey.200",
        }}
        image={product.image_url || "/placeholder.png"}
        alt={product.name}
      />

      {/* Product Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        {/* Product Name */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            fontSize: compact ? "0.95rem" : "1.1rem",
            lineHeight: 1.3,
            minHeight: compact ? "2.6em" : "2.8em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
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
              mb: 2,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "2.8em",
            }}
          >
            {product.description}
          </Typography>
        )}

        {/* Price */}
        <Typography
          variant="h5"
          color="text.primary"
          sx={{
            fontWeight: 700,
            mb: 1,
            fontSize: compact ? "1.3rem" : "1.5rem",
          }}
        >
          ${product.price?.toFixed(2)}
        </Typography>

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
                  onClick={handleDecrement}
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
                  onClick={handleIncrement}
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
                py: 1.2,
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              AGREGAR
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
