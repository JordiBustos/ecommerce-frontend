import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  LocalShipping as ShippingIcon,
  OpenInNew as OpenInNewIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import orderService from "../../services/orderService";
import productService from "../../services/productService";
import config from "../../config";
import { useForm } from "../../hooks";

/**
 * Admin page to edit order details
 */
const AdminEditOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState(null);
  const [enrichedItems, setEnrichedItems] = useState([]);

  const { values, errors, handleChange, setFormValues, handleSubmit } = useForm(
    {
      status: "",
      shipping_address: "",
      replacement_criterion: "",
      comment: "",
      estimated_delivery_date: "",
    },
    handleSaveOrder,
    validateForm
  );

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  /**
   * Load order details and enrich with product information
   */
  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrder(orderId);
      setOrder(orderData);

      // Set form values from order data
      setFormValues({
        status: orderData.status || "",
        shipping_address: orderData.shipping_address || "",
        replacement_criterion: orderData.replacement_criterion || "",
        comment: orderData.comment || "",
        estimated_delivery_date: orderData.estimated_delivery_date
          ? orderData.estimated_delivery_date.split("T")[0]
          : "",
      });

      // Fetch product details for each order item
      if (orderData.items && orderData.items.length > 0) {
        const itemsWithProducts = await Promise.all(
          orderData.items.map(async (item) => {
            try {
              const product = await productService.getProductById(item.product_id);
              return { ...item, product };
            } catch (err) {
              console.error(`Failed to fetch product ${item.product_id}:`, err);
              return { ...item, product: null };
            }
          })
        );
        setEnrichedItems(itemsWithProducts);
      } else {
        setEnrichedItems([]);
      }
    } catch (error) {
      enqueueSnackbar("Failed to load order details", { variant: "error" });
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate form
   */
  function validateForm(values) {
    const errors = {};

    if (!values.status || values.status.trim() === "") {
      errors.status = "Status is required";
    }

    return errors;
  }

  /**
   * Handle save order
   */
  async function handleSaveOrder(formValues) {
    try {
      setSaving(true);

      const updateData = {
        status: formValues.status,
        shipping_address: formValues.shipping_address || null,
        replacement_criterion: formValues.replacement_criterion || null,
        comment: formValues.comment || null,        estimated_delivery_date: formValues.estimated_delivery_date || null,      };

      await orderService.updateOrder(orderId, updateData);
      enqueueSnackbar("Order updated successfully", { variant: "success" });
      navigate("/admin/orders");
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.detail || "Failed to update order",
        { variant: "error" }
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    const statusColors = {
      pending: "warning",
      processing: "info",
      shipped: "primary",
      delivered: "success",
      cancelled: "error",
    };
    return statusColors[status?.toLowerCase()] || "default";
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  if (!order) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/orders")}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Edit Order #{orderId}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update order information and status
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Edit Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Order Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* Status */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    error={!!errors.status}
                    helperText={errors.status}
                    required
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </TextField>
                </Grid>

                {/* Shipping Address */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Shipping Address"
                    name="shipping_address"
                    value={values.shipping_address}
                    onChange={handleChange}
                    helperText="Update shipping address if needed"
                  />
                </Grid>

                {/* Replacement Criterion */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Replacement Criterion"
                    name="replacement_criterion"
                    value={values.replacement_criterion}
                    onChange={handleChange}
                    helperText="Criteria for product replacement"
                  />
                </Grid>

                {/* Comment */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Customer Comment"
                    name="comment"
                    value={values.comment}
                    onChange={handleChange}
                    helperText="Comment from customer to admin (provided during checkout)"
                  />
                </Grid>

                {/* Estimated Delivery Date */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Estimated Delivery Date"
                    name="estimated_delivery_date"
                    value={values.estimated_delivery_date}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="Expected delivery date for this order"
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/admin/orders")}
                      disabled={saving}
                      fullWidth
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={saving}
                      fullWidth
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Order Details (Read-only) */}
        <Grid item xs={12} md={6}>
          {/* Customer & Order Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Order Details
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Order ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    #{order.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {order.user_id || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ${(order.total_amount || 0).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Current Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(order.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Updated At
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(order.updated_at)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Shipping Snapshot */}
          {(order.snapshot_full_name || order.snapshot_address_line1) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <ShippingIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Shipping Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {order.snapshot_full_name && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Name:</strong> {order.snapshot_full_name}
                  </Typography>
                )}
                {order.snapshot_address_line1 && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Address:</strong> {order.snapshot_address_line1}
                  </Typography>
                )}
                {order.snapshot_address_line2 && (
                  <Typography variant="body2" gutterBottom>
                    {order.snapshot_address_line2}
                  </Typography>
                )}
                {order.snapshot_city && (
                  <Typography variant="body2" gutterBottom>
                    <strong>City:</strong> {order.snapshot_city}
                  </Typography>
                )}
                {order.snapshot_province && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Province:</strong> {order.snapshot_province}
                  </Typography>
                )}
                {order.snapshot_postal_code && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Postal Code:</strong> {order.snapshot_postal_code}
                  </Typography>
                )}
                {order.snapshot_country && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Country:</strong> {order.snapshot_country}
                  </Typography>
                )}
                {order.snapshot_phone_number && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Phone:</strong> {order.snapshot_phone_number}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ShoppingCartIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Order Items ({order.items?.length || 0})
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enrichedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.product ? (
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: #{item.product_id}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Product #{item.product_id} (Not found)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          ${(item.price || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ${((item.price || 0) * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Receipts */}
          {order.receipts && order.receipts.length > 0 && (
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <ReceiptIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Payment Receipts ({order.receipts.length})
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {order.receipts.map((receipt) => {
                    const receiptUrl = `${config.api.baseURL}/${receipt.file_path}`;
                    const isImage = receipt.file_type?.toLowerCase().includes("image");
                    const isPdf = receipt.file_type?.toLowerCase().includes("pdf");

                    return (
                      <Card key={receipt.id} variant="outlined">
                        <CardContent>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {isImage ? (
                              <ImageIcon color="primary" />
                            ) : isPdf ? (
                              <PdfIcon color="error" />
                            ) : (
                              <ReceiptIcon color="action" />
                            )}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Type:</strong> {receipt.file_type}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Uploaded: {formatDate(receipt.uploaded_at)}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              size="small"
                              endIcon={<OpenInNewIcon />}
                              component={Link}
                              href={receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textTransform: "none" }}
                            >
                              View Receipt
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminEditOrderPage;
