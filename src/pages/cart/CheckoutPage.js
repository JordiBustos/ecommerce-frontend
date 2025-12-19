import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  LocalShipping,
  Store as StoreIcon,
  Add as AddIcon,
  LocalOffer as CouponIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "notistack";
import userService from "../../services/userService";
import storeService from "../../services/storeService";
import orderService from "../../services/orderService";
import couponService from "../../services/couponService";

/**
 * Checkout page component
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [physicalStores, setPhysicalStores] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState("home"); // 'home' or 'pickup'
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [comment, setComment] = useState("");
  const [replacementCriterion, setReplacementCriterion] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Address dialog state
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    province: "",
    country: "",
    postal_code: "",
    phone_number: "",
    is_default: false,
  });

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  /**
   * Load addresses and physical stores
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [addressesData, storesData] = await Promise.all([
        userService.getAddresses(),
        storeService.getPhysicalStores(),
      ]);

      setAddresses(addressesData);
      setPhysicalStores(storesData);

      // Auto-select first address if available
      if (addressesData && addressesData.length > 0) {
        setSelectedAddressId(addressesData[0].id);
      }

      // Auto-select first store if available
      if (storesData && storesData.length > 0) {
        setSelectedStoreId(storesData[0].id);
      }
    } catch (error) {
      enqueueSnackbar("Failed to load checkout data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      enqueueSnackbar("Your cart is empty", { variant: "warning" });
      navigate("/cart");
      return;
    }

    loadData();
  }, [cart, navigate, loadData, enqueueSnackbar]);

  /**
   * Calculate total
   */
  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const shippingCost = deliveryMethod === "home" ? 0 : 0; // TODO
  const subtotal = calculateSubtotal();
  
  // Calculate discount from coupon
  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? (subtotal * appliedCoupon.discount_value) / 100
      : appliedCoupon.discount_value
    : 0;
  
  const total = subtotal + shippingCost - discountAmount;

  /**
   * Handle applying coupon
   */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      enqueueSnackbar("Please enter a coupon code", { variant: "warning" });
      return;
    }

    try {
      setValidatingCoupon(true);
      const response = await couponService.validateCoupon(couponCode.trim().toUpperCase(), total);
      
      if (response.valid) {
        // Check minimum order amount
        if (response.coupon.min_order_amount > subtotal) {
          enqueueSnackbar(
            `Minimum order amount of $${response.coupon.min_order_amount.toFixed(2)} required`,
            { variant: "error" }
          );
          return;
        }
        
        setAppliedCoupon(response.coupon);
        enqueueSnackbar("Coupon applied successfully!", { variant: "success" });
      } else {
        enqueueSnackbar(response.message || "Invalid coupon code", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.detail || "Failed to validate coupon",
        { variant: "error" }
      );
    } finally {
      setValidatingCoupon(false);
    }
  };

  /**
   * Handle removing coupon
   */
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    enqueueSnackbar("Coupon removed", { variant: "info" });
  };

  /**
   * Handle opening address dialog
   */
  const handleOpenAddressDialog = () => {
    setNewAddress({
      full_name: user?.full_name || "",
      address_line1: "",
      address_line2: "",
      city: "",
      province: "",
      country: "",
      postal_code: "",
      phone_number: user?.phone_number || "",
      is_default: addresses.length === 0,
    });
    setShowAddressDialog(true);
  };

  /**
   * Handle closing address dialog
   */
  const handleCloseAddressDialog = () => {
    setShowAddressDialog(false);
    setNewAddress({
      full_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      province: "",
      country: "",
      postal_code: "",
      phone_number: "",
      is_default: false,
    });
  };

  /**
   * Handle saving new address
   */
  const handleSaveAddress = async () => {
    // Validate required fields
    if (!newAddress.full_name.trim()) {
      enqueueSnackbar("Full name is required", { variant: "warning" });
      return;
    }
    if (!newAddress.address_line1.trim()) {
      enqueueSnackbar("Address line 1 is required", { variant: "warning" });
      return;
    }
    if (!newAddress.city.trim()) {
      enqueueSnackbar("City is required", { variant: "warning" });
      return;
    }
    if (!newAddress.province.trim()) {
      enqueueSnackbar("Province is required", { variant: "warning" });
      return;
    }
    if (!newAddress.country.trim()) {
      enqueueSnackbar("Country is required", { variant: "warning" });
      return;
    }
    if (!newAddress.postal_code.trim()) {
      enqueueSnackbar("Postal code is required", { variant: "warning" });
      return;
    }

    try {
      const savedAddress = await userService.addAddress(newAddress);
      enqueueSnackbar("Address added successfully", { variant: "success" });

      // Refresh addresses
      const updatedAddresses = await userService.getAddresses();
      setAddresses(updatedAddresses);

      // Auto-select the new address
      setSelectedAddressId(savedAddress.id);

      handleCloseAddressDialog();
    } catch (error) {
      // Error handled by global error handler
    }
  };

  /**
   * Handle checkout submission
   */
  const handleSubmit = () => {
    // Validate selection
    if (deliveryMethod === "home" && !selectedAddressId) {
      enqueueSnackbar("Please select a delivery address", {
        variant: "warning",
      });
      return;
    }

    if (deliveryMethod === "pickup" && !selectedStoreId) {
      enqueueSnackbar("Please select a pickup store", { variant: "warning" });
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  /**
   * Handle confirmed order submission
   */
  const handleConfirmOrder = async () => {
    setShowConfirmDialog(false);

    try {
      setSubmitting(true);

      const itemsArray = Array.isArray(cart.items)
        ? cart.items
        : Object.values(cart.items || {});

      const orderData = {
        address_id: deliveryMethod === "home" ? selectedAddressId : null,
        physical_store_id: deliveryMethod === "pickup" ? selectedStoreId : null,
        items: itemsArray.map((item) => ({
          product_id: item.product_id ?? item.product?.id,
          quantity: item.quantity,
        })),
        replacement_criterion: replacementCriterion || "",
        comment: comment || "",
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
      };

      const order = await orderService.createOrder(orderData);

      clearCart();
      navigate("/order-confirmation", { state: { order } });
    } catch (error) {
      enqueueSnackbar("Failed to place order. Please try again.", {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress sx={{ color: 'black' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 6 }}>
        Checkout
      </Typography>

      <Grid container spacing={8}>
        {/* Left Column - Checkout Form */}
        <Grid item xs={12} md={7}>
          {/* 1. Personal Data */}
          <Box sx={{ mb: 6, border: '1px solid #e0e0e0', p: 4 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>1. Personal Information</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {user?.email || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Full Name:</strong> {user?.full_name || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Phone:</strong> {user?.phone_number || "N/A"}
                </Typography>
              </Box>
          </Box>

          {/* 2. Delivery Method */}
          <Box sx={{ mb: 6, border: '1px solid #e0e0e0', p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 4 }}>
                2. Delivery Method
              </Typography>

              <Box display="flex" gap={2} mt={2}>
                <Button
                  variant={deliveryMethod === "home" ? "contained" : "outlined"}
                  onClick={() => setDeliveryMethod("home")}
                  startIcon={<LocalShipping />}
                  fullWidth
                  sx={{ 
                    py: 2, 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    bgcolor: deliveryMethod === "home" ? 'black' : 'transparent',
                    color: deliveryMethod === "home" ? 'white' : 'black',
                    borderColor: 'black',
                    '&:hover': {
                        bgcolor: deliveryMethod === "home" ? '#333' : '#f5f5f5',
                        borderColor: 'black'
                    }
                  }}
                >
                  Home Delivery
                </Button>
                <Button
                  variant={
                    deliveryMethod === "pickup" ? "contained" : "outlined"
                  }
                  onClick={() => setDeliveryMethod("pickup")}
                  startIcon={<StoreIcon />}
                  fullWidth
                  sx={{ 
                    py: 2, 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    bgcolor: deliveryMethod === "pickup" ? 'black' : 'transparent',
                    color: deliveryMethod === "pickup" ? 'white' : 'black',
                    borderColor: 'black',
                    '&:hover': {
                        bgcolor: deliveryMethod === "pickup" ? '#333' : '#f5f5f5',
                        borderColor: 'black'
                    }
                  }}
                >
                  Store Pickup
                </Button>
              </Box>

              {/* Delivery Address Selection */}
              {deliveryMethod === "home" && (
                <Box mt={4}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                      Delivery Address
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddressDialog}
                      sx={{ color: 'black', fontWeight: 600, textTransform: 'uppercase' }}
                    >
                      New Address
                    </Button>
                  </Box>
                  {addresses.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 0 }}>
                      You have no saved addresses. Click "New Address" to add
                      one.
                    </Alert>
                  ) : (
                    <FormControl fullWidth>
                      <InputLabel>Select an address</InputLabel>
                      <Select
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        label="Select an address"
                        sx={{ borderRadius: 0 }}
                      >
                        {addresses.map((address) => (
                          <MenuItem key={address.id} value={address.id}>
                            {address.address_line1}, {address.city},{" "}
                            {address.province} - {address.postal_code}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {selectedAddressId && (
                    <Box mt={2} p={2} bgcolor="#f9f9f9" border="1px solid #eee">
                      {(() => {
                        const addr = addresses.find(
                          (a) => a.id === selectedAddressId
                        );
                        return addr ? (
                          <>
                            <Typography variant="body2">
                              <strong>Name:</strong> {addr.full_name || "N/A"}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Address:</strong> {addr.address_line1}
                              {addr.address_line2 && `, ${addr.address_line2}`}
                            </Typography>
                            <Typography variant="body2">
                              <strong>City:</strong> {addr.city}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Province:</strong> {addr.province}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Country:</strong> {addr.country}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Postal Code:</strong> {addr.postal_code}
                            </Typography>
                            {addr.phone_number && (
                              <Typography variant="body2">
                                <strong>Phone:</strong> {addr.phone_number}
                              </Typography>
                            )}
                          </>
                        ) : null;
                      })()}
                    </Box>
                  )}
                </Box>
              )}

              {/* Store Pickup Selection */}
              {deliveryMethod === "pickup" && (
                <Box mt={4}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Select Store
                  </Typography>
                  {physicalStores.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 0 }}>
                      No physical stores available for pickup.
                    </Alert>
                  ) : (
                    <>
                      <FormControl fullWidth>
                        <InputLabel>Select store</InputLabel>
                        <Select
                          value={selectedStoreId}
                          onChange={(e) => setSelectedStoreId(e.target.value)}
                          label="Select store"
                          sx={{ borderRadius: 0 }}
                        >
                          {physicalStores.map((store) => (
                            <MenuItem key={store.id} value={store.id}>
                              {store.name} - {store.address_line1}, {store.city}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {selectedStoreId && (
                        <Box mt={2} p={2} bgcolor="#f9f9f9" border="1px solid #eee">
                          {(() => {
                            const store = physicalStores.find(
                              (s) => s.id === selectedStoreId
                            );
                            return store ? (
                              <>
                                <Typography variant="body2">
                                  <strong>Store:</strong> {store.name}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Address:</strong>{" "}
                                  {store.address_line1}
                                  {store.address_line2 &&
                                    `, ${store.address_line2}`}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>City:</strong> {store.city},{" "}
                                  {store.postal_code}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Country:</strong> {store.country}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Phone:</strong> {store.phone}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Email:</strong> {store.email}
                                </Typography>
                              </>
                            ) : null;
                          })()}
                        </Box>
                      )}
                    </>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={2}
                  >
                    Changing the delivery method may affect the final cost and
                    product availability.
                  </Typography>
                </Box>
              )}
          </Box>

          {/* 3. Payment Method */}
          <Box sx={{ mb: 6, border: '1px solid #e0e0e0', p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 2 }}>
                3. Payment Method
              </Typography>
              <Alert severity="info" sx={{ borderRadius: 0 }}>
                Payments are accepted exclusively via bank transfer. Please
                remember that payment must be made within 48 hours of placing
                your order for it to be processed and shipped.
              </Alert>
          </Box>

          {/* Additional Options */}
          <Box sx={{ mb: 6, border: '1px solid #e0e0e0', p: 4 }}>
              <TextField
                fullWidth
                label="Replacement Criterion"
                value={replacementCriterion}
                onChange={(e) => setReplacementCriterion(e.target.value)}
                placeholder="If a product is not available..."
                sx={{ mb: 4 }}
                variant="outlined"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Add comments or instructions about your order"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Additional comments..."
                variant="outlined"
              />
          </Box>

          {/* Confirm Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={
              submitting ||
              (deliveryMethod === "home" && !selectedAddressId) ||
              (deliveryMethod === "pickup" && !selectedStoreId)
            }
            sx={{ 
                bgcolor: 'black', 
                color: 'white', 
                py: 2, 
                fontWeight: 900, 
                textTransform: 'uppercase',
                '&:hover': { bgcolor: '#333' }
            }}
          >
            {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "CONFIRM ORDER"}
          </Button>
        </Grid>

        {/* Right Column - Order Summary */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: "sticky", top: 100, bgcolor: '#f5f5f5', p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 4 }}>
                Order Summary
              </Typography>

              <Divider sx={{ my: 2, borderColor: 'black' }} />

              {/* Products */}
              {cart?.items?.map((item) => (
                <Box key={item.id} display="flex" gap={2} mb={2}>
                  <Box
                    component="img"
                    src={item.product?.image_url || "/placeholder.png"}
                    alt={item.product?.name}
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: "contain",
                      bgcolor: 'white',
                      p: 0.5
                    }}
                  />
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                      {item.product?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qty: {item.quantity}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 4, borderColor: '#ddd' }} />

              {/* Coupon Section */}
              {!appliedCoupon ? (
                <Box sx={{ mb: 4 }}>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="ENTER COUPON CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyCoupon();
                        }
                      }}
                      disabled={validatingCoupon}
                      InputProps={{
                        startAdornment: <CouponIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        sx: { borderRadius: 0 }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      sx={{ minWidth: 80, whiteSpace: 'nowrap', borderRadius: 0, borderColor: 'black', color: 'black', fontWeight: 700 }}
                    >
                      {validatingCoupon ? <CircularProgress size={20} /> : 'APPLY'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Alert
                  severity="success"
                  onClose={handleRemoveCoupon}
                  sx={{ mb: 4, borderRadius: 0 }}
                  icon={<CouponIcon />}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {appliedCoupon.code} applied
                  </Typography>
                  <Typography variant="caption">
                    {appliedCoupon.description}
                  </Typography>
                </Alert>
              )}

              {/* Pricing */}
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Subtotal</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Shipping</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ${shippingCost.toFixed(2)}
                </Typography>
              </Box>

              {appliedCoupon && (
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="success.main" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Discount ({appliedCoupon.discount_type === 'percentage' 
                      ? `${appliedCoupon.discount_value}%` 
                      : `$${appliedCoupon.discount_value}`})
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    -${discountAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 4, borderColor: 'black' }} />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" sx={{ textTransform: 'uppercase', fontWeight: 900 }}>Total</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 900, color: 'black' }}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Add Address Dialog */}
      <Dialog
        open={showAddressDialog}
        onClose={handleCloseAddressDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Add new address</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={newAddress.full_name}
              onChange={(e) =>
                setNewAddress({ ...newAddress, full_name: e.target.value })
              }
              margin="normal"
              required
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Address Line 1"
              value={newAddress.address_line1}
              onChange={(e) =>
                setNewAddress({ ...newAddress, address_line1: e.target.value })
              }
              margin="normal"
              required
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Address Line 2 (Optional)"
              value={newAddress.address_line2}
              onChange={(e) =>
                setNewAddress({ ...newAddress, address_line2: e.target.value })
              }
              margin="normal"
              variant="outlined"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  margin="normal"
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Province"
                  value={newAddress.province}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, province: e.target.value })
                  }
                  margin="normal"
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={newAddress.country}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, country: e.target.value })
                  }
                  margin="normal"
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={newAddress.postal_code}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      postal_code: e.target.value,
                    })
                  }
                  margin="normal"
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Phone"
              value={newAddress.phone_number}
              onChange={(e) =>
                setNewAddress({ ...newAddress, phone_number: e.target.value })
              }
              margin="normal"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddressDialog} sx={{ color: 'black', fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleSaveAddress} variant="contained" sx={{ bgcolor: 'black', color: 'white', fontWeight: 700, '&:hover': { bgcolor: '#333' } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Confirm Order</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to place this order?
          </Typography>
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              <strong>Delivery Method:</strong>{" "}
              {deliveryMethod === "home" ? "Home Delivery" : "Store Pickup"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Total:</strong> ${total.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} sx={{ color: 'black', fontWeight: 700 }}>Cancel</Button>
          <Button
            onClick={handleConfirmOrder}
            variant="contained"
            disabled={submitting}
            sx={{ bgcolor: 'black', color: 'white', fontWeight: 700, '&:hover': { bgcolor: '#333' } }}
          >
            {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;
