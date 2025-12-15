import React from "react";
import { Container, Typography, Box, Chip } from "@mui/material";
import { ReceiptOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useDataFetching from "../hooks/useDataFetching";
import DataTable from "../components/DataTable";
import apiClient from "../services/api";

/**
 * Get status color based on order status
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
 * Admin page to view all orders
 */
const AdminOrdersPage = () => {
  const navigate = useNavigate();

  const {
    data: orders,
    loading,
    error,
  } = useDataFetching(async () => {
    const response = await apiClient.get("/orders/all/admin");
    return response.data;
  }, []);

  const columns = [
    {
      field: "id",
      header: "Order ID",
      sortable: true,
      render: (row) => `#${row.id}`,
    },
    {
      field: "user_id",
      header: "User ID",
      sortable: true,
      render: (row) => row.user_id || "N/A",
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <Chip
          label={row.status || "Unknown"}
          color={getStatusColor(row.status)}
          size="small"
        />
      ),
    },
    {
      field: "total_amount",
      header: "Total",
      sortable: true,
      render: (row) => `$${(row.total_amount || 0).toFixed(2)}`,
    },
    {
      field: "created_at",
      header: "Order Date",
      sortable: true,
      render: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A",
    },
  ];

  const handleRowClick = (order) => {
    navigate(`/orders/${order.id}`, { state: { from: 'admin' } });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          All Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all customer orders
        </Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading orders: {error}
        </Typography>
      )}

      <DataTable
        columns={columns}
        data={orders || []}
        loading={loading}
        onRowClick={handleRowClick}
        emptyState={{
          icon: ReceiptOutlined,
          iconColor: "primary.main",
          title: "No Orders Found",
          description: "There are no orders in the system yet.",
        }}
      />
    </Container>
  );
};

export default AdminOrdersPage;
