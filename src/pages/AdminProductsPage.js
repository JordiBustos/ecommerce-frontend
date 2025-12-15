import React, { useState } from "react";
import { Container, Typography, Box, Chip, Button } from "@mui/material";
import { InventoryOutlined, AddOutlined } from "@mui/icons-material";
import useDataFetching from "../hooks/useDataFetching";
import DataTable from "../components/DataTable";
import productService from "../services/productService";

/**
 * Admin page to view all products
 */
const AdminProductsPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: response,
    loading,
    error,
  } = useDataFetching(() => productService.getProducts(), [refreshKey]);

  // Extract products array from response (API returns { products: [...] } or just [...])
  const products = Array.isArray(response) ? response : response?.products || [];

  const columns = [
    {
      field: "id",
      header: "ID",
      render: (row) => `#${row.id}`,
    },
    {
      field: "name",
      header: "Product Name",
    },
    {
      field: "category",
      header: "Category",
      sortable: true,
      render: (row) => (
        <Chip
          label={row.category?.name || row.category || "Uncategorized"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "price",
      header: "Price",
      render: (row) => `$${(row.price || 0).toFixed(2)}`,
    },
    {
      field: "stock",
      header: "Stock",
      render: (row) => {
        const stock = row.stock || 0;
        const color =
          stock === 0 ? "error" : stock < 10 ? "warning" : "success";
        return <Chip label={`${stock} units`} size="small" color={color} />;
      },
    },
    {
      field: "is_active",
      header: "Status",
      render: (row) => (
        <Chip
          label={row.is_active ? "Active" : "Inactive"}
          size="small"
          color={row.is_active ? "success" : "default"}
        />
      ),
    },
    {
      field: "created_at",
      header: "Created",
      render: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A",
    },
  ];

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            All Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all products in the inventory
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={handleRefresh} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => alert("Add product feature - to be implemented")}
          >
            Add Product
          </Button>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => alert("Add products from CSV feature - to be implemented")}
          >
            Import products from CSV
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading products: {error}
        </Typography>
      )}

      <DataTable
        columns={columns}
        data={products || []}
        loading={loading}
        emptyState={{
          icon: InventoryOutlined,
          iconColor: "primary.main",
          title: "No Products Found",
          description: "There are no products in the inventory yet.",
        }}
      />
    </Container>
  );
};

export default AdminProductsPage;
