import { useState, useEffect, useMemo, useCallback } from "react";
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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  InventoryOutlined,
  AddOutlined,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { DataTable, PageHeader, FilterPanel } from "../../../components";
import productService from "../../../services/productService";

/**
 * Admin page to view all products
 */
const AdminProductsPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // all, active, inactive
  const [selectedStock, setSelectedStock] = useState(""); // all, in-stock, low-stock, out-of-stock

  const [sortBy, setSortBy] = useState(""); // price, stock, created_at
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);

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

  /**
   * Handle import modal open
   */
  const handleOpenImportModal = () => {
    setImportModalOpen(true);
    setImportFile(null);
    setImportResult(null);
  };

  /**
   * Handle import modal close
   */
  const handleCloseImportModal = () => {
    setImportModalOpen(false);
    setImportFile(null);
    setImportResult(null);
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        enqueueSnackbar("Please select a CSV file", { variant: "error" });
        return;
      }
      setImportFile(file);
      setImportResult(null);
    }
  };

  /**
   * Handle CSV import
   */
  const handleImport = async () => {
    if (!importFile) {
      enqueueSnackbar("Please select a file", { variant: "warning" });
      return;
    }

    try {
      setImporting(true);
      const result = await productService.importProductsFromCSV(importFile);
      setImportResult(result);

      if (result.successful > 0) {
        enqueueSnackbar(`Successfully imported ${result.successful} products`, {
          variant: "success",
        });
        // Refresh the products list
        setRefreshKey((prev) => prev + 1);
      }

      if (result.failed > 0) {
        enqueueSnackbar(`${result.failed} products failed to import`, {
          variant: "warning",
        });
      }
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.detail || "Failed to import products",
        { variant: "error" }
      );
    } finally {
      setImporting(false);
    }
  };

  /**
   * Handle delete all products dialog open
   */
  const handleOpenDeleteAllDialog = () => {
    setDeleteAllDialogOpen(true);
    setDeleteAllConfirmText("");
  };

  /**
   * Handle delete all products dialog close
   */
  const handleCloseDeleteAllDialog = () => {
    setDeleteAllDialogOpen(false);
    setDeleteAllConfirmText("");
  };

  /**
   * Handle delete all products confirm
   */
  const handleDeleteAllConfirm = async () => {
    if (deleteAllConfirmText !== "DELETE ALL PRODUCTS") {
      enqueueSnackbar("Please type the confirmation text correctly", {
        variant: "warning",
      });
      return;
    }

    try {
      setDeletingAll(true);
      const result = await productService.deleteAllProducts();
      enqueueSnackbar(result.message || "All products deleted successfully", {
        variant: "success",
      });
      handleCloseDeleteAllDialog();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.detail || "Failed to delete all products",
        { variant: "error" }
      );
    } finally {
      setDeletingAll(false);
    }
  };

  /**
   * Load products
   */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const skip = (page - 1) * itemsPerPage;
      const params = {
        skip,
        limit: itemsPerPage,
      };

      // Add API-supported filters
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (selectedCategory) {
        params.categories_id = [parseInt(selectedCategory)];
      }
      if (selectedBrand) {
        params.brands_id = [parseInt(selectedBrand)];
      }

      const data = await productService.getProducts(params);

      // Handle both array and object responses
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalProducts(data.length);
      } else if (data.products) {
        setProducts(data.products);
        setTotalProducts(data.total || data.products.length);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (err) {
      const errorMsg = "Failed to load products";
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [
    page,
    searchQuery,
    selectedCategory,
    selectedBrand,
    itemsPerPage,
    enqueueSnackbar,
  ]);

  /**
   * Load products when filters or page change
   */
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /**
   * Reload products (for after delete)
   */
  useEffect(() => {
    if (refreshKey > 0) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Apply client-side filters (status and stock - not supported by API)
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product) => {
      // Status filter (client-side only)
      if (selectedStatus === "active" && !product.is_active) return false;
      if (selectedStatus === "inactive" && product.is_active) return false;

      // Stock filter (client-side only)
      if (selectedStock) {
        const stock = product.stock || 0;
        if (selectedStock === "out-of-stock" && stock !== 0) return false;
        if (selectedStock === "low-stock" && (stock === 0 || stock >= 10))
          return false;
        if (selectedStock === "in-stock" && stock === 0) return false;
      }

      return true;
    });

    // Apply sorting
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case "price":
            aValue = a.price || 0;
            bValue = b.price || 0;
            break;
          case "stock":
            aValue = a.stock || 0;
            bValue = b.stock || 0;
            break;
          case "created_at":
            aValue = new Date(a.created_at || 0).getTime();
            bValue = new Date(b.created_at || 0).getTime();
            break;
          default:
            return 0;
        }

        if (sortOrder === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    return filtered;
  }, [products, selectedStatus, selectedStock, sortBy, sortOrder]);

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
              navigate(`/admin/products/${row.slug}/edit`);
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

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setPage(1); // Reset to first page
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    setPage(1); // Reset to first page
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    // Status is client-side filter, no need to reset page
  };

  const handleStockChange = (value) => {
    setSelectedStock(value);
    // Stock is client-side filter, no need to reset page
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedStatus("");
    setSelectedStock("");
    setSortBy("");
    setSortOrder("desc");
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

  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedCategory ||
      selectedBrand ||
      selectedStatus ||
      selectedStock ||
      sortBy
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="All Products"
        description="View and manage all products in the inventory"
        action={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={() => navigate("/admin/products/add")}
            >
              Add Product
            </Button>
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={handleOpenImportModal}
            >
              Import from CSV
            </Button>
          </Box>
        }
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading products: {error}
        </Typography>
      )}

      {/* Filters Section */}
      <FilterPanel
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        resultsInfo={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedStatus || selectedStock ? (
                <>
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products on this page (Total: {totalProducts})
                </>
              ) : (
                <>
                  Showing {products.length} of {totalProducts} products
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
        {/* Search */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            placeholder="Name, SKU, Description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </Grid>

        {/* Category Filter */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
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
              onChange={(e) => handleBrandChange(e.target.value)}
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
              onChange={(e) => handleStatusChange(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Stock Filter */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Stock Level</InputLabel>
            <Select
              value={selectedStock}
              onChange={(e) => handleStockChange(e.target.value)}
              label="Stock Level"
            >
              <MenuItem value="">All Stock Levels</MenuItem>
              <MenuItem value="in-stock">In Stock</MenuItem>
              <MenuItem value="low-stock">Low Stock (&lt;10)</MenuItem>
              <MenuItem value="out-of-stock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Sort By */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="stock">Stock</MenuItem>
              <MenuItem value="created_at">Date Created</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Sort Order */}
        {sortBy && (
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Order"
              >
                <MenuItem value="asc">
                  {sortBy === "created_at" ? "Oldest First" : "Low to High"}
                </MenuItem>
                <MenuItem value="desc">
                  {sortBy === "created_at" ? "Newest First" : "High to Low"}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </FilterPanel>

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
      {totalProducts > itemsPerPage && (
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

      {/* Import CSV Modal */}
      <Dialog
        open={importModalOpen}
        onClose={handleCloseImportModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Products from CSV</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Upload a CSV file to import products in bulk. The file should
            include columns for: name, price, category, slug, sku, ean,
            description, stock, etc.
          </DialogContentText>

          <Box sx={{ mt: 2 }}>
            <input
              accept=".csv"
              style={{ display: "none" }}
              id="csv-file-input"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="csv-file-input">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                disabled={importing}
              >
                {importFile ? importFile.name : "Select CSV File"}
              </Button>
            </label>
          </Box>

          {importResult && (
            <Box sx={{ mt: 3 }}>
              <Alert
                severity={importResult.failed > 0 ? "warning" : "success"}
                sx={{ mb: 2 }}
              >
                {importResult.message}
              </Alert>

              <Box
                sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}
              >
                <Typography variant="body2" gutterBottom>
                  <strong>Total rows:</strong> {importResult.total_rows}
                </Typography>
                <Typography variant="body2" gutterBottom color="success.main">
                  <strong>Successful:</strong> {importResult.successful}
                </Typography>
                <Typography variant="body2" gutterBottom color="error.main">
                  <strong>Failed:</strong> {importResult.failed}
                </Typography>

                {importResult.errors && importResult.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Errors:
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <Typography
                          key={index}
                          variant="caption"
                          display="block"
                          color="error"
                          sx={{ mb: 0.5 }}
                        >
                          {error}
                        </Typography>
                      ))}
                      {importResult.errors.length > 10 && (
                        <Typography variant="caption" color="text.secondary">
                          ... and {importResult.errors.length - 10} more errors
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportModal} disabled={importing}>
            {importResult ? "Close" : "Cancel"}
          </Button>
          {!importResult && (
            <Button
              onClick={handleImport}
              color="primary"
              variant="contained"
              disabled={!importFile || importing}
            >
              {importing ? "Importing..." : "Import"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete All Products Dialog */}
      <Dialog
        open={deleteAllDialogOpen}
        onClose={handleCloseDeleteAllDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "error.main", display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon /> Delete All Products
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>DANGER:</strong> This action will permanently delete ALL products from the database. This cannot be undone!
          </Alert>
          <DialogContentText sx={{ mb: 2 }}>
            You are about to delete <strong>{totalProducts} products</strong>. This will remove all product data including images, descriptions, inventory, and associations.
          </DialogContentText>
          <DialogContentText sx={{ mb: 2 }}>
            To confirm, type <strong>DELETE ALL PRODUCTS</strong> in the box below:
          </DialogContentText>
          <TextField
            fullWidth
            variant="outlined"
            value={deleteAllConfirmText}
            onChange={(e) => setDeleteAllConfirmText(e.target.value)}
            placeholder="DELETE ALL PRODUCTS"
            autoFocus
            disabled={deletingAll}
            error={deleteAllConfirmText !== "" && deleteAllConfirmText !== "DELETE ALL PRODUCTS"}
            helperText={deleteAllConfirmText !== "" && deleteAllConfirmText !== "DELETE ALL PRODUCTS" ? "Text must match exactly" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteAllDialog} disabled={deletingAll}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAllConfirm}
            color="error"
            variant="contained"
            disabled={deleteAllConfirmText !== "DELETE ALL PRODUCTS" || deletingAll}
          >
            {deletingAll ? "Deleting..." : "Delete All Products"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Danger Zone */}
      <Box sx={{ mt: 6 }}>
        <Accordion
          sx={{
            border: "2px solid",
            borderColor: "error.main",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: "error.main",
              color: "error.contrastText",
              "&:hover": { bgcolor: "error.dark" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WarningIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Danger Zone
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              The actions in this section are destructive and cannot be undone. Proceed with extreme caution.
            </Alert>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Delete All Products
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Permanently delete all {totalProducts} products from the database
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                onClick={handleOpenDeleteAllDialog}
                disabled={totalProducts === 0}
              >
                Delete All
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
};

export default AdminProductsPage;
