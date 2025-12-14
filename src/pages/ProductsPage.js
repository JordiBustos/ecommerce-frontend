import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Pagination,
  IconButton,
  Drawer,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import productService from "../services/productService";
import { useCart } from "../contexts/CartContext";
import ProductCard from "../components/ProductCard";
import { useSnackbar } from "notistack";

/**
 * Products page component
 */
const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const itemsPerPage = 12;
  const { addToCart } = useCart();
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Load categories and brands
   */
  const loadFilters = useCallback(async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        productService.getCategories(),
        productService.getBrands(),
      ]);
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (err) {
      enqueueSnackbar("Failed to load filters", { variant: "error" });
    }
  }, [enqueueSnackbar]);

  /**
   * Debounce search input to avoid spamming requests
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchInput]);

  /**
   * Load categories and brands on mount
   */
  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  /**
   * Handle URL category parameter
   */
  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId && categories.length > 0) {
      const numericCategoryId = parseInt(categoryId, 10);
      if (!selectedCategories.includes(numericCategoryId)) {
        setSelectedCategories([numericCategoryId]);
      }
    }
  }, [searchParams, categories, selectedCategories]);

  /**
   * Load products
   */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const skip = (page - 1) * itemsPerPage;

      let data;
      if (searchQuery.trim()) {
        data = await productService.searchProducts(searchQuery, {
          skip,
          limit: itemsPerPage,
        });
      } else {
        const params = {
          skip,
          limit: itemsPerPage,
        };

        if (selectedCategories.length > 0) {
          params.categories_id = selectedCategories;
        }

        if (selectedBrands.length > 0) {
          params.brands_id = selectedBrands;
        }

        data = await productService.getProducts(params);
      }

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
  }, [page, searchQuery, selectedCategories, selectedBrands, enqueueSnackbar]);

  /**
   * Load products when filters or page change
   */
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /**
   * Handle category filter change
   */
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setSearchQuery(""); // Clear search when using filters
    setPage(1); // Reset to first page
  };

  /**
   * Handle brand filter change
   */
  const handleBrandChange = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
    setSearchQuery(""); // Clear search when using filters
    setPage(1); // Reset to first page
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchQuery("");
    setPage(1);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Handle add to cart
   * @param {number} productId
   * @param {number} quantity
   */
  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await addToCart(productId, quantity);
      enqueueSnackbar(`Added ${quantity} item(s) to cart`, {
        variant: "success",
      });
    } catch (err) {
      enqueueSnackbar("Failed to add to cart", { variant: "error" });
    }
  };

  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    searchQuery.trim();

  /**
   * Filters sidebar component
   */
  const FiltersSidebar = () => {
    const displayedCategories = showAllCategories
      ? categories
      : categories.slice(0, 5);
    const displayedBrands = showAllBrands ? brands : brands.slice(0, 5);

    return (
      <Paper elevation={2} sx={{ p: 3, position: "sticky", top: 80 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Filters</Typography>
          {hasActiveFilters && (
            <IconButton size="small" onClick={clearFilters} color="primary">
              <ClearIcon />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Categories */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Categories
        </Typography>
        <FormGroup sx={{ mb: 1 }}>
          {displayedCategories.map((category) => (
            <FormControlLabel
              key={category.id}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  size="small"
                />
              }
              label={<Typography variant="body2">{category.name}</Typography>}
            />
          ))}
        </FormGroup>
        {categories.length > 5 && (
          <Button
            size="small"
            onClick={() => setShowAllCategories(!showAllCategories)}
            endIcon={
              showAllCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            sx={{ mb: 2 }}
          >
            {showAllCategories ? "Show Less" : `See All (${categories.length})`}
          </Button>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Brands */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Brands
        </Typography>
        <FormGroup sx={{ mb: 1 }}>
          {displayedBrands.map((brand) => (
            <FormControlLabel
              key={brand.id}
              control={
                <Checkbox
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleBrandChange(brand.id)}
                  size="small"
                />
              }
              label={<Typography variant="body2">{brand.name}</Typography>}
            />
          ))}
        </FormGroup>
        {brands.length > 5 && (
          <Button
            size="small"
            onClick={() => setShowAllBrands(!showAllBrands)}
            endIcon={showAllBrands ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showAllBrands ? "Show Less" : `See All (${brands.length})`}
          </Button>
        )}
      </Paper>
    );
  };

  if (loading && products.length === 0) {
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Products Catalogue
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {totalProducts > 0 &&
            `${totalProducts} product${
              totalProducts !== 1 ? "s" : ""
            } available`}
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <IconButton
            sx={{ display: { xs: "flex", md: "none" } }}
            onClick={() => setFiltersOpen(true)}
          >
            <FilterListIcon />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Search by name, description, SKU, EAN, category, or brand..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
          />
          {hasActiveFilters && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              sx={{ minWidth: 100 }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Filters Sidebar - Desktop */}
        <Grid item xs={12} md={3} sx={{ display: { xs: "none", md: "block" } }}>
          <FiltersSidebar />
        </Grid>

        {/* Filters Drawer - Mobile */}
        <Drawer
          anchor="left"
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          sx={{ display: { md: "none" } }}
        >
          <Box sx={{ width: 280, p: 2 }}>
            <FiltersSidebar />
          </Box>
        </Drawer>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="40vh"
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {products.length > 0 ? (
                <>
                  <Grid container spacing={3}>
                    {products.map((product) => (
                      <Grid item xs={12} sm={6} lg={4} key={product.id}>
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                    >
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No products found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or search query
                  </Typography>
                  {hasActiveFilters && (
                    <Button
                      variant="outlined"
                      onClick={clearFilters}
                      sx={{ mt: 2 }}
                      startIcon={<ClearIcon />}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductsPage;
