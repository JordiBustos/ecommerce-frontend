import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
} from "@mui/material";
import {
  InventoryOutlined,
  AddOutlined,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import useDataFetching from "../../hooks/useDataFetching";
import DataTable from "../../components/DataTable";
import productService from "../../services/productService";

/**
 * Admin page to view all products
 */
const AdminProductsPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // all, active, inactive
  const [selectedStock, setSelectedStock] = useState(""); // all, in-stock, low-stock, out-of-stock

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: response,
    loading,
    error,
  } = useDataFetching(() => {
    const skip = (page - 1) * itemsPerPage;
    return productService.getProducts({ skip, limit: itemsPerPage });
  }, [refreshKey, page]);

  // Extract products array from response
  const products = Array.isArray(response)
    ? response
    : response?.products || [];

  // Update total products count when response changes
  useEffect(() => {
    if (response) {
      // If API returns total, use it; otherwise estimate from products length
      if (response.total !== undefined) {
        setTotalProducts(response.total);
      } else if (Array.isArray(response)) {
        // If no pagination info, assume this is all products
        setTotalProducts(response.length);
      } else if (response.products) {
        // Estimate based on whether we got a full page
        const currentCount = response.products.length;
        if (currentCount < itemsPerPage) {
          // Last page
          setTotalProducts((page - 1) * itemsPerPage + currentCount);
        } else {
          // More pages might exist, estimate
          setTotalProducts(page * itemsPerPage + 1);
        }
      }
    }
  }, [response, page, itemsPerPage]);

  // Load categories and brands for filters
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    };
    loadFilters();
  }, []);

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          product.name?.toLowerCase().includes(query) ||
          product.sku?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (
        selectedCategory &&
        product.category_id !== parseInt(selectedCategory)
      ) {
        return false;
      }

      // Brand filter
      if (selectedBrand && product.brand_id !== parseInt(selectedBrand)) {
        return false;
      }

      // Status filter
      if (selectedStatus === "active" && !product.is_active) return false;
      if (selectedStatus === "inactive" && product.is_active) return false;

      // Stock filter
      if (selectedStock) {
        const stock = product.stock || 0;
        if (selectedStock === "out-of-stock" && stock !== 0) return false;
        if (selectedStock === "low-stock" && (stock === 0 || stock >= 10))
          return false;
        if (selectedStock === "in-stock" && stock === 0) return false;
      }

      return true;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedStatus,
    selectedStock,
  ]);

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
    {
      field: "actions",
      header: "Actions",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${row.id}/edit`);
            }}
            size="small"
            title="Edit product"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            size="small"
            title="Delete product"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedStatus("");
    setSelectedStock("");
    setPage(1);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      await productService.deleteProduct(productToDelete.id);
      enqueueSnackbar(
        `Product "${productToDelete.name}" deleted successfully`,
        {
          variant: "success",
        }
      );
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      handleRefresh();
    } catch (error) {
      console.error("Failed to delete product:", error);
      // Error notification handled by API interceptor
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedBrand ||
    selectedStatus ||
    selectedStock;

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
            onClick={() =>
              alert("Add products from CSV feature - to be implemented")
            }
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

      {/* Filters Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Filters
          </Typography>
          {hasActiveFilters && (
            <Button
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              size="small"
              color="secondary"
            >
              Clear Filters
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Name, SKU, Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Brand Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Brand</InputLabel>
              <Select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                label="Brand"
              >
                <MenuItem value="">All Brands</MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Stock Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Stock Level</InputLabel>
              <Select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                label="Stock Level"
              >
                <MenuItem value="">All Stock Levels</MenuItem>
                <MenuItem value="in-stock">In Stock</MenuItem>
                <MenuItem value="low-stock">Low Stock (&lt;10)</MenuItem>
                <MenuItem value="out-of-stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Results count */}
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredProducts.length} of {totalProducts} products
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
      </Paper>

      <DataTable
        columns={columns}
        data={filteredProducts || []}
        loading={loading}
        emptyState={{
          icon: InventoryOutlined,
          iconColor: "primary.main",
          title: hasActiveFilters
            ? "No Products Match Filters"
            : "No Products Found",
          description: hasActiveFilters
            ? "Try adjusting your filters to see more results."
            : "There are no products in the inventory yet.",
        }}
      />

      {/* Pagination */}
      {!hasActiveFilters && filteredProducts.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={Math.ceil(totalProducts / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the product{" "}
            <strong>{productToDelete?.name}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProductsPage;
