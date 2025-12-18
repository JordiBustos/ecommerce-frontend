import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  TextField,
  Alert,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Pagination,
  IconButton,
  Drawer,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import productService from "../../services/productService.js";
import { useCart } from "../../contexts/CartContext.js";
import ProductCard from "../../components/ProductCard.js";
import { SidebarSkeleton, CardSkeleton } from "../../components/ProductsSkeletons.js";
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
  const [categoryPath, setCategoryPath] = useState([]); // Track drill-down path
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
   * Get all descendant category IDs for a given category
   * @param {number} categoryId - Parent category ID
   * @returns {number[]} Array of all descendant category IDs
   */
  const getDescendantCategoryIds = useCallback(
    (categoryId) => {
      const descendants = [];
      const findChildren = (parentId) => {
        const children = categories.filter((cat) => cat.parent_id === parentId);
        children.forEach((child) => {
          descendants.push(child.id);
          findChildren(child.id); // Recursively find grandchildren
        });
      };
      findChildren(categoryId);
      return descendants;
    },
    [categories]
  );

  /**
   * Get children of a category
   */
  const getCategoryChildren = useCallback(
    (parentId) => {
      return categories.filter((cat) => cat.parent_id === parentId);
    },
    [categories]
  );

  /**
   * Handle category drill-down navigation
   */
  const handleCategoryClick = (category) => {
    const children = getCategoryChildren(category.id);

    if (children.length > 0) {
      // Has children, add to path for drill-down
      setCategoryPath((prev) => [...prev, category]);
    } else {
      // No children, select for filtering
      setSelectedCategories([category.id]);
      setSearchQuery("");
      setPage(1);
    }
  };

  /**
   * Handle filtering by parent category (including all descendants)
   */
  const handleFilterByParentCategory = (category) => {
    const descendants = getDescendantCategoryIds(category.id);
    setSelectedCategories([category.id, ...descendants]);
    setSearchQuery("");
    setPage(1);
  };

  /**
   * Navigate back in category path
   */
  const handleCategoryBack = (index) => {
    if (index === -1) {
      // Back to root
      setCategoryPath([]);
    } else {
      // Back to specific level
      setCategoryPath((prev) => prev.slice(0, index + 1));
    }
  };

  /**
   * Clear category navigation and filters
   */
  const clearCategoryNavigation = () => {
    setCategoryPath([]);
    setSelectedCategories([]);
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
    setCategoryPath([]);
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
      console.error(err);
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
    // Get current level categories based on path
    const currentParentId = categoryPath.length > 0
      ? categoryPath[categoryPath.length - 1].id
      : null;

    const currentLevelCategories = categories.filter(
      (cat) => cat.parent_id === currentParentId
    );

    const displayedCategories = showAllCategories
      ? currentLevelCategories
      : currentLevelCategories.slice(0, 10);
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

        {/* Breadcrumb navigation */}
        {categoryPath.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button
              size="small"
              onClick={() => handleCategoryBack(-1)}
              sx={{ mb: 1, textTransform: "none" }}
            >
              ← All Categories
            </Button>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
              {categoryPath.map((cat, index) => (
                <Box key={cat.id} sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    size="small"
                    onClick={() => handleCategoryBack(index - 1)}
                    sx={{
                      textTransform: "none",
                      minWidth: "auto",
                      color: "text.secondary",
                      fontSize: "0.875rem"
                    }}
                  >
                    {cat.name}
                  </Button>
                  {index < categoryPath.length - 1 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
                      /
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 1 }} />
          </Box>
        )}

        {/* Selected category chip */}
        {selectedCategories.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {selectedCategories.slice(0, 3).map((catId) => {
              const category = categories.find((c) => c.id === catId);
              return category ? (
                <Chip
                  key={catId}
                  label={category.name}
                  onDelete={clearCategoryNavigation}
                  size="small"
                  color="primary"
                  sx={{ mr: 1, mb: 1 }}
                />
              ) : null;
            })}
            {selectedCategories.length > 3 && (
              <Chip
                label={`+${selectedCategories.length - 3} more`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            )}
          </Box>
        )}

        {/* Filter by current parent category */}
        {categoryPath.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={() => handleFilterByParentCategory(categoryPath[categoryPath.length - 1])}
              sx={{ textTransform: "none" }}
            >
              Show all {categoryPath[categoryPath.length - 1].name} products
            </Button>
          </Box>
        )}

        {/* Current level categories */}
        <Box sx={{ mb: 1 }}>
          {displayedCategories.map((category) => {
            const hasChildren = getCategoryChildren(category.id).length > 0;
            return (
              <Button
                key={category.id}
                fullWidth
                onClick={() => handleCategoryClick(category)}
                sx={{
                  justifyContent: "space-between",
                  textTransform: "none",
                  mb: 0.5,
                  py: 1,
                  px: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Typography variant="body2">{category.name}</Typography>
                {hasChildren && <ExpandMoreIcon fontSize="small" sx={{ transform: "rotate(-90deg)" }} />}
              </Button>
            );
          })}
        </Box>
        {currentLevelCategories.length > 10 && (
          <Button
            size="small"
            onClick={() => setShowAllCategories(!showAllCategories)}
            endIcon={
              showAllCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            sx={{ mb: 2 }}
          >
            {showAllCategories ? "Show Less" : `See All (${currentLevelCategories.length})`}
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Products Catalogue
        </Typography>
        {/* Skeleton header */}
        {loading ? (
          <Skeleton width={200} />
        ) : (
          <Typography variant="body1" color="text.secondary">
            {totalProducts > 0 &&
              `${totalProducts} product${totalProducts !== 1 ? "s" : ""
              } available`}
          </Typography>
        )}
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
          {/* Skeleton Sidebar */}
          {loading ? (
            <SidebarSkeleton />
          ) : (
            <FiltersSidebar />
          )}
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
            /* Skeletons Products Grid */
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  <CardSkeleton />
                </Grid>
              ))}
            </Grid>
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
