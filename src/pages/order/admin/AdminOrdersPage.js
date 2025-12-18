import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Pagination,
  Button,
  ButtonGroup,
} from "@mui/material";
import { ReceiptOutlined, Edit as EditIcon, AttachMoney } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  DataTable,
  PageHeader,
  StatusChip,
  FilterPanel,
} from "../../../components";
import apiClient from "../../../services/api";

/**
 * Admin page to view all orders
 */
const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Data states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);
  const [periodTotal, setPeriodTotal] = useState(0);

  // Filter states
  const [searchUserId, setSearchUserId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  /**
   * Get today's date in ISO 8601 format
   */
  const getToday = useCallback(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split("T")[0];
  }, []);

  /**
   * Get start of week in ISO 8601 format (Monday)
   */
  const getWeekStart = useCallback(() => {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(date.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString().split("T")[0];
  }, []);

  /**
   * Get start of month in ISO 8601 format
   */
  const getMonthStart = useCallback(() => {
    const date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth.toISOString().split("T")[0];
  }, []);

  /**
   * Handle date range preset button click
   */
  const handleDateRangePreset = useCallback((range) => {
    setSelectedDateRange(range);
    const today = getToday();
    const now = new Date();
    const tomorrowISO = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    switch (range) {
      case "today":
        setStartDate(today);
        setEndDate(tomorrowISO);
        break;
      case "week":
        setStartDate(getWeekStart());
        setEndDate(tomorrowISO);
        break;
      case "month":
        setStartDate(getMonthStart());
        setEndDate(tomorrowISO);
        break;
      case "all":
        setStartDate("");
        setEndDate("");
        break;
      default:
        break;
    }
    setPage(1);
  }, [getToday, getWeekStart, getMonthStart]);

  /**
   * Load orders with pagination and filters
   */
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const skip = (page - 1) * itemsPerPage;
      const params = {
        skip,
        limit: itemsPerPage,
      };

      // Add date range parameters if set
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }

      const response = await apiClient.get("/orders/all/admin", { params });
      const data = response.data;

      let ordersData = [];
      let total = 0;
      let pTotal = 0;

      if (Array.isArray(data)) {
        ordersData = data;
        total = data.length;
        pTotal = 0;
      } else if (data.orders) {
        ordersData = data.orders;
        total = data.total || data.orders.length;
        pTotal = data.period_total || 0;
      }

      if (Array.isArray(ordersData)) {
        ordersData = ordersData.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA;
        });
      }

      setOrders(ordersData);
      setTotalOrders(total);
      setPeriodTotal(pTotal);
    } catch (err) {
      const errorMsg = "Failed to load orders";
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, startDate, endDate, enqueueSnackbar]);

  /**
   * Load orders when page changes
   */
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      if (searchUserId && !order.user_id?.toString().includes(searchUserId)) {
        return false;
      }
      if (selectedStatus && order.status !== selectedStatus) {
        return false;
      }
      if (minAmount && (order.total_amount || 0) < parseFloat(minAmount)) {
        return false;
      }
      if (maxAmount && (order.total_amount || 0) > parseFloat(maxAmount)) {
        return false;
      }

      return true;
    });
  }, [orders, searchUserId, selectedStatus, minAmount, maxAmount]);

  const handleClearFilters = () => {
    setSearchUserId("");
    setSelectedStatus("");
    setMinAmount("");
    setMaxAmount("");
    setStartDate("");
    setEndDate("");
    setSelectedDateRange("all");
    setPeriodTotal(0);
    setPage(1);
  };

  useEffect(() => {
    if (searchUserId || selectedStatus || minAmount || maxAmount) {
      setPage(1);
    }
  }, [searchUserId, selectedStatus, minAmount, maxAmount]);

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  const hasActiveFilters =
    searchUserId || selectedStatus || minAmount || maxAmount || startDate || endDate;
  
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
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A",
    },
    {
      field: "actions",
      header: "Actions",
      render: (row) => (
        <IconButton
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/orders/${row.id}/edit`);
          }}
          size="small"
          title="Edit order"
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  const handleRowClick = (order) => {
    navigate(`/orders/${order.id}`, { state: { from: "admin" } });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="All Orders"
        description="View and manage all customer orders"
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading orders: {error}
        </Typography>
      )}

      {/* Period Stats Card */}
      {(startDate || endDate || selectedDateRange !== "all") && (
        <Box
          sx={{
            mb: 3,
            p: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 2,
            color: "white",
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AttachMoney
                  sx={{
                    fontSize: 32,
                    color: "white",
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total de Período
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mt: 0.5,
                  }}
                >
                  ${periodTotal.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {orders.length} ordenes en esta página
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  mt: 1,
                }}
              >
                {selectedDateRange === "today" && "📅 Hoy"}
                {selectedDateRange === "week" && "📅 Esta Semana"}
                {selectedDateRange === "month" && "📅 Este Mes"}
                {selectedDateRange === "custom" &&
                  `📅 ${startDate} a ${endDate}`}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Filters Section */}
      <FilterPanel
        hasActiveFilters={!!hasActiveFilters}
        onClearFilters={handleClearFilters}
        resultsInfo={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {hasActiveFilters ? (
                <>
                  Showing {filteredOrders.length} of {orders.length} orders on
                  this page (Total: {totalOrders})
                </>
              ) : (
                <>
                  Showing {orders.length} of {totalOrders} orders
                </>
              )}
            </Typography>
            {hasActiveFilters && (
              <Chip
                label="Filtered"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        }
      >
        {/* Date Range Presets */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Date Range:
            </Typography>
            <ButtonGroup size="small" variant="outlined">
              <Button
                onClick={() => handleDateRangePreset("all")}
                variant={selectedDateRange === "all" ? "contained" : "outlined"}
              >
                All Time
              </Button>
              <Button
                onClick={() => handleDateRangePreset("today")}
                variant={selectedDateRange === "today" ? "contained" : "outlined"}
              >
                Today
              </Button>
              <Button
                onClick={() => handleDateRangePreset("week")}
                variant={selectedDateRange === "week" ? "contained" : "outlined"}
              >
                This Week
              </Button>
              <Button
                onClick={() => handleDateRangePreset("month")}
                variant={selectedDateRange === "month" ? "contained" : "outlined"}
              >
                This Month
              </Button>
            </ButtonGroup>
          </Box>
        </Grid>

        {/* Custom Date Range */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setSelectedDateRange("custom");
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setSelectedDateRange("custom");
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* User ID Search */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="User ID"
            placeholder="Search by User ID"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            type="number"
          />
        </Grid>

        {/* Status Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Min Amount Filter */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Min Amount"
            placeholder="$0.00"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        {/* Max Amount Filter */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Max Amount"
            placeholder="$9999.99"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filteredOrders || []}
        loading={loading}
        onRowClick={handleRowClick}
        emptyState={{
          icon: ReceiptOutlined,
          iconColor: "primary.main",
          title: hasActiveFilters
            ? "No Orders Match Filters"
            : "No Orders Found",
          description: hasActiveFilters
            ? "Try adjusting your filters to see more results."
            : "There are no orders in the system yet.",
        }}
      />

      {/* Pagination */}
      {totalOrders > itemsPerPage && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default AdminOrdersPage;
