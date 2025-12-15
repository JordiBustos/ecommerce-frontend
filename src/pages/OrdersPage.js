import { Container, Typography, Chip } from "@mui/material";
import { Receipt as ReceiptIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useDataFetching from "../hooks/useDataFetching";
import { DataTable, StatusChip, PageHeader } from "../components";
import orderService from "../services/orderService";

/**
 * Orders page component - Lists all user orders
 */
const OrdersPage = () => {
  const navigate = useNavigate();

  const {
    data: orders,
    loading,
    error,
  } = useDataFetching(() => orderService.getOrders(), []);

  const columns = [
    {
      field: "id",
      header: "Order ID",
      sortable: true,
      render: (row) => `#${row.id}`,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusChip status={row.status} />,
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
        row.created_at
          ? new Date(row.created_at).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "N/A",
    },
    {
      header: "Items",
      render: (row) => (
        <Chip
          label={`${row.items?.length || 0} items`}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
  ];

  const handleRowClick = (order) => {
    navigate(`/orders/${order.id}`, { state: { from: 'orders' } });
  };

  if (orders)
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="My Orders"
        description="View and manage your orders"
      />

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
          icon: ReceiptIcon,
          iconColor: "primary.main",
          title: "No Orders Yet",
          description:
            "You haven't placed any orders yet. Start shopping to create your first order and track your purchases here.",
          actionLabel: "Start Shopping",
          onAction: () => navigate("/products"),
        }}
      />
    </Container>
  );
};

export default OrdersPage;
