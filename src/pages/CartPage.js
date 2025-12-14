import React from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  Paper,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add,
  Remove,
  ShoppingCartOutlined as EmptyCartIcon,
  Storefront as StorefrontIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useSnackbar } from "notistack";

/**
 * Cart page component
 */
const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Handle quantity change
   * @param {number} itemId
   * @param {Object} product
   * @param {number} currentQuantity
   * @param {number} delta
   */
  const handleQuantityChange = async (
    itemId,
    product,
    currentQuantity,
    delta
  ) => {
    const newQuantity = currentQuantity + delta;

    if (newQuantity <= 0) {
      return;
    }

    const isAlwaysInStock = product?.is_always_in_stock || false;
    const maxQuantity = product?.max_per_buy;
    const stock = product?.stock || 0;

    // Validate max quantity per purchase
    if (newQuantity > maxQuantity) {
      enqueueSnackbar(`Maximum ${maxQuantity} per purchase for this product`, {
        variant: "warning",
      });
      return;
    }

    // Validate stock availability (only if not always in stock)
    if (!isAlwaysInStock && newQuantity > stock) {
      enqueueSnackbar(`Only ${stock} units available in stock`, {
        variant: "warning",
      });
      return;
    }

    try {
      await updateCartItem(itemId, newQuantity);
      enqueueSnackbar("Cart updated", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to update cart", { variant: "error" });
    }
  };

  /**
   * Calculate total
   * @returns {number}
   */
  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          Shopping Cart
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
              bgcolor: 'info.light',
              mb: 3,
            }}
          >
            <EmptyCartIcon sx={{ fontSize: 60, color: 'info.main' }} />
          </Box>
          
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Your Cart is Empty
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Looks like you haven't added anything to your cart yet.
            Browse our products and add items you like!
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<StorefrontIcon />}
            onClick={() => navigate("/products")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Browse Products
          </Button>
        </Paper>
      </Container>
    );
  }


  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {cart.items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6">
                      {item.product?.name || "Product"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${item.product?.price?.toFixed(2) || "0.00"} each
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.product?.is_always_in_stock
                        ? "In Stock"
                        : `Stock: ${item.product?.stock || 0}`}
                    </Typography>
                    {item.product?.max_per_buy ? (
                      <Typography variant="body2" color="text.secondary">
                        Max per purchase: {item.product.max_per_buy}
                      </Typography>
                    ) : (
                      <></>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.product,
                            item.quantity,
                            -1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        size="small"
                        value={item.quantity}
                        sx={{ width: 60 }}
                        inputProps={{ style: { textAlign: "center" } }}
                        disabled
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.product,
                            item.quantity,
                            1
                          )
                        }
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6">
                        $
                        {((item.product?.price || 0) * item.quantity).toFixed(
                          2
                        )}
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outlined"
            color="error"
            onClick={clearCart}
            sx={{ mt: 2 }}
          >
            Clear Cart
          </Button>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${calculateTotal().toFixed(2)}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>$0.00</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
