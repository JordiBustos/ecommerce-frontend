import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import orderService from "../services/orderService";

/**
 * Orders page component - Lists all user orders
 */
const OrdersPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  /**
   * Load user orders
   */
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      enqueueSnackbar("Failed to load orders", { variant: "error" });
    } finally {
      setLoading(false);
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

  // sort by date descending
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        My Orders
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage your orders
      </Typography>

      {orders.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            mt: 6,
            py: 8,
            px: 4,
            textAlign: "center",
            bgcolor: "grey.50",
            borderRadius: 3,
            border: "2px dashed",
            borderColor: "grey.300",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "success.light",
              mb: 3,
            }}
          >
            <ReceiptIcon sx={{ fontSize: 60, color: "success.main" }} />
          </Box>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            No Orders Yet
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
          >
            You haven't placed any orders yet. Start shopping to create your
            first order and track your purchases here.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={() => navigate("/products")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell>
                  <strong>Order ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Total</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Items</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status || "pending"}
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <strong>${order.total_amount?.toFixed(2) || "0.00"}</strong>
                  </TableCell>
                  <TableCell align="center">
                    {order.items?.length || 0}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default OrdersPage;
