import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Avatar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Comment as CommentIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import orderService from "../services/orderService";
import productService from "../services/productService";
import config from "../config";

/**
 * Order detail page component
 */
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  /**
   * Load order details
   */
  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrder(orderId);
      setOrder(data);
      
      // Fetch product details for each item
      if (data.items && data.items.length > 0) {
        const itemsWithProducts = await Promise.all(
          data.items.map(async (item) => {
            try {
              const product = await productService.getProductById(item.product_id);
              return {
                ...item,
                product: product,
              };
            } catch (error) {
              console.error(`Failed to load product ${item.product_id}:`, error);
              return {
                ...item,
                product: null,
              };
            }
          })
        );
        setOrderItems(itemsWithProducts);
      }
    } catch (error) {
      enqueueSnackbar("Failed to load order details", { variant: "error" });
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  }, [orderId, enqueueSnackbar, navigate]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  /**
   * Handle file selection
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  /**
   * Handle receipt upload
   */
  const handleUploadReceipt = async () => {
    if (!selectedFile) {
      enqueueSnackbar("Please select a file first", { variant: "warning" });
      return;
    }

    try {
      setUploading(true);
      await orderService.uploadReceipt(orderId, selectedFile);
      enqueueSnackbar("Receipt uploaded successfully", { variant: "success" });
      setSelectedFile(null);
      await loadOrder();
    } catch (error) {
      enqueueSnackbar("Failed to upload receipt", { variant: "error" });
    } finally {
      setUploading(false);
    }
  };

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
    return statusColors[status] || "default";
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

  /**
   * Calculate subtotal
   */
  const calculateSubtotal = () => {
    if (!orderItems || orderItems.length === 0) return 0;
    return orderItems.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);
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
          onClick={() => navigate("/orders")}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Order Details #{order.id}
          </Typography>
          <Chip
            label={order.status || "pending"}
            color={getStatusColor(order.status)}
            sx={{ textTransform: "capitalize", fontWeight: 600 }}
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Order Details" />
          <Tab label="Upload Receipt" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 ? (
        <>
          {/* Info Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Date Card */}
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CalendarIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Date</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Order Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(order.created_at)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Delivery Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {order.delivery_date
                        ? formatDate(order.delivery_date)
                        : "Not specified"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Delivery Card */}
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <ShippingIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Delivery</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Method
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {order.delivery_method || "Standard"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Delivery Address
                    </Typography>
                    <Typography variant="body2">
                      {order.address?.address_line1 || "No address specified"}
                    </Typography>
                    {order.address?.address_line2 && (
                      <Typography variant="body2">
                        {order.address.address_line2}
                      </Typography>
                    )}
                    {order.address && (
                      <Typography variant="body2">
                        {order.address.city}, {order.address.province}{" "}
                        {order.address.postal_code}
                      </Typography>
                    )}
                  </Box>
                  {order.received_by && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Received by
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {order.received_by}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Payment & Comments Card */}
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PaymentIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Payment Method</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 3 }}>
                    {order.payment_method || "Not specified"}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CommentIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="h6">Comments</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {order.comments || "-"}
                  </Typography>

                  {order.receipts && order.receipts.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <ReceiptIcon sx={{ mr: 1, color: "success.main" }} />
                        <Typography variant="h6">
                          Receipts ({order.receipts.length})
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ReceiptIcon />}
                        onClick={() => setActiveTab(1)}
                        fullWidth
                      >
                        View Receipts
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Products Table */}
          <Paper elevation={2} sx={{ mb: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell>
                      <strong>Image</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Product</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Unit Price</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Quantity</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Total Price</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Avatar
                          src={item.product?.image_url || "/placeholder.png"}
                          alt={item.product?.name}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {item.product?.name || "Unknown Product"}
                        </Typography>
                        {item.product?.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.product.description.substring(0, 60)}
                            {item.product.description.length > 60 ? "..." : ""}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        ${item.price?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">
                        <strong>
                          $
                          {((item.price || 0) * (item.quantity || 0)).toFixed(
                            2
                          )}
                        </strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />

            {/* Total Section */}
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">Sub Total:</Typography>
                    <Typography variant="body1">
                      ${calculateSubtotal().toFixed(2)}
                    </Typography>
                  </Box>
                  {order.shipping_cost && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1">Shipping:</Typography>
                      <Typography variant="body1">
                        ${order.shipping_cost.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      TOTAL:
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      $
                      {order.total?.toFixed(2) ||
                        calculateSubtotal().toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </>
      ) : (
        /* Upload Receipt Tab */
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Upload Payment Receipt
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload proof of payment for your order
          </Typography>

          <Box sx={{ mb: 3 }}>
            <input
              accept="image/*,.pdf"
              style={{ display: "none" }}
              id="receipt-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="receipt-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Select File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            onClick={handleUploadReceipt}
            disabled={!selectedFile || uploading}
            fullWidth
            size="large"
          >
            {uploading ? <CircularProgress size={24} /> : "Upload Receipt"}
          </Button>

          {order.receipts && order.receipts.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 3 }} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ReceiptIcon sx={{ mr: 1, color: "success.main" }} />
                  <Typography variant="h6">
                    Uploaded Receipts ({order.receipts.length})
                  </Typography>
                </Box>
              </Box>

              {/* Receipts Grid */}
              <Grid container spacing={2}>
                {order.receipts.map((receipt) => (
                  <Grid item xs={12} md={6} key={receipt.id}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                      }}
                    >
                      {/* Receipt Header */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Chip
                          label={`Receipt #${receipt.id}`}
                          color="success"
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(receipt.uploaded_at).toLocaleDateString(
                            "es-ES"
                          )}
                        </Typography>
                      </Box>

                      {/* Receipt Preview */}
                      <Box sx={{ textAlign: "center" }}>
                        {receipt.file_type === "application/pdf" ? (
                          <Box>
                            <ReceiptIcon
                              sx={{
                                fontSize: 80,
                                color: "text.secondary",
                                mb: 2,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              PDF Document
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              href={`${config.api.baseURL}/${receipt.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              fullWidth
                              sx={{ mt: 1 }}
                            >
                              Open PDF
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <Box
                              component="img"
                              src={`${config.api.baseURL}/${receipt.file_path}`}
                              alt={`Receipt #${receipt.id}`}
                              sx={{
                                maxWidth: "100%",
                                maxHeight: 300,
                                borderRadius: 1,
                                mb: 2,
                                objectFit: "contain",
                              }}
                            />
                            <Button
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              href={`${config.api.baseURL}/${receipt.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              fullWidth
                            >
                              Open Full Size
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default OrderDetailPage;
