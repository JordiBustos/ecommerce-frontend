import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Add,
  Remove,
  ShoppingCartOutlined as EmptyCartIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useCart } from "../../contexts/CartContext";
import EmptyState from "../../components/EmptyState";

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
      <Container sx={{ py: 8 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{ fontWeight: 900, textTransform: "uppercase", mb: 4 }}
        >
          Shopping Cart
        </Typography>

        <EmptyState
          icon={EmptyCartIcon}
          iconColor="black"
          title="Your Bag is Empty"
          description="Looks like you haven't added anything to your bag yet."
          actionLabel="Start Shopping"
          onAction={() => navigate("/products")}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontWeight: 900, textTransform: "uppercase", mb: 6 }}
      >
        Your Bag
      </Typography>

      <Grid container spacing={8}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {/* Header Row */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              borderBottom: "1px solid black",
              pb: 2,
              mb: 4,
            }}
          >
            <Typography
              sx={{ flex: 2, fontWeight: 700, textTransform: "uppercase" }}
            >
              Product
            </Typography>
            <Typography
              sx={{
                flex: 1,
                fontWeight: 700,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              Quantity
            </Typography>
            <Typography
              sx={{
                flex: 1,
                fontWeight: 700,
                textTransform: "uppercase",
                textAlign: "right",
              }}
            >
              Total
            </Typography>
          </Box>

          {cart.items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                py: 4,
                borderBottom: "1px solid #eee",
              }}
            >
              {/* Product Info */}
              <Box
                sx={{
                  flex: 2,
                  display: "flex",
                  gap: 3,
                  width: "100%",
                  mb: { xs: 2, md: 0 },
                }}
              >
                <Box
                  component="img"
                  src={item.product?.image_url || "/placeholder.png"}
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: "contain",
                    bgcolor: "#f5f5f5",
                    p: 1,
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, textTransform: "uppercase" }}
                  >
                    {item.product?.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    ${item.product?.price?.toFixed(2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Max per buy: {item.product?.max_per_buy} 
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => removeFromCart(item.id)}
                    sx={{
                      color: "text.secondary",
                      textDecoration: "underline",
                      p: 0,
                      minWidth: 0,
                      "&:hover": { color: "error.main" },
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              </Box>

              {/* Quantity */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: { xs: "space-between", md: "center" },
                  width: "100%",
                  alignItems: "center",
                  mb: { xs: 2, md: 0 },
                }}
              >
                <Typography sx={{ display: { md: "none" }, fontWeight: 600 }}>
                  Quantity:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #e0e0e0",
                  }}
                >
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
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography sx={{ px: 2, fontWeight: 600 }}>
                    {item.quantity}
                  </Typography>
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
                    disabled={
                      (item.quantity >= item.product?.stock && !item.product?.is_always_in_stock) ||
                      item.quantity >= item.product?.max_per_buy
                    }
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Total */}
              <Box
                sx={{
                  flex: 1,
                  textAlign: "right",
                  width: "100%",
                  display: "flex",
                  justifyContent: { xs: "space-between", md: "flex-end" },
                }}
              >
                <Typography sx={{ display: { md: "none" }, fontWeight: 600 }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          ))}

          <Box sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={clearCart}
              sx={{
                textTransform: "uppercase",
                fontWeight: 700,
                borderColor: "#e0e0e0",
              }}
            >
              Clear Bag
            </Button>
          </Box>
        </Grid>

        {/* Summary */}
        <Grid item xs={12} md={4}>
          <Box sx={{ bgcolor: "#f5f5f5", p: 4 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, textTransform: "uppercase", mb: 4 }}
            >
              Summary
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                Subtotal
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}
            >
              <Typography sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                Shipping
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>Free</Typography>
            </Box>

            <Divider sx={{ mb: 4, borderColor: "black" }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}
            >
              <Typography
                variant="h6"
                sx={{ textTransform: "uppercase", fontWeight: 900 }}
              >
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate("/checkout")}
              sx={{
                bgcolor: "black",
                color: "white",
                py: 2,
                fontWeight: 900,
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#333" },
              }}
            >
              Checkout
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
