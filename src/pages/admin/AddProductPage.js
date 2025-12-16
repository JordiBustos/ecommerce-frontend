import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  InputAdornment,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, SaveOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import productService from "../../services/productService";
import { useForm } from "../../hooks";

/**
 * Page for adding a new product
 */
const AddProductPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load categories and brands
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        enqueueSnackbar("Failed to load form data", { variant: "error" });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [enqueueSnackbar]);

  // Form handling
  const initialValues = {
    sku: "",
    ean: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    is_always_in_stock: false,
    max_per_buy: "",
    weight: "",
    units_per_package: 1,
    category_id: "",
    brand_id: "",
    image_url: "",
    slug: "",
  };

  const validateForm = (values) => {
    const errors = {};

    if (!values.name?.trim()) {
      errors.name = "Product name is required";
    }

    if (!values.price || values.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (!values.is_always_in_stock && (!values.stock || values.stock < 0)) {
      errors.stock = "Stock is required when not always in stock";
    }

    if (!values.category_id) {
      errors.category_id = "Category is required";
    }

    if (!values.slug?.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
      errors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    return errors;
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Convert string values to numbers
      const productData = {
        ...values,
        price: parseFloat(values.price) || 0,
        stock: parseInt(values.stock) || 0,
        max_per_buy: values.max_per_buy ? parseInt(values.max_per_buy) : null,
        weight: values.weight ? parseFloat(values.weight) : null,
        units_per_package: parseInt(values.units_per_package) || 1,
        category_id: parseInt(values.category_id),
        brand_id: values.brand_id ? parseInt(values.brand_id) : null,
      };

      await productService.createProduct(productData);
      enqueueSnackbar("Product created successfully", { variant: "success" });
      navigate("/admin/products");
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.detail || "Failed to create product",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const {
    values,
    errors,
    handleChange,
    handleSubmit: onSubmit,
  } = useForm(initialValues, handleSubmit, validateForm);

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    handleChange(e);

    // Auto-generate slug if it's empty or hasn't been manually edited
    if (!values.slug || values.slug === generateSlug(values.name)) {
      const slugEvent = {
        target: {
          name: "slug",
          value: generateSlug(name),
        },
      };
      handleChange(slugEvent);
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  if (loadingData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/products")}
          sx={{ mb: 2 }}
        >
          Back to Products
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Add New Product
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details to create a new product
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={values.sku}
                onChange={handleChange}
                helperText="Stock Keeping Unit (optional)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="EAN"
                name="ean"
                value={values.ean}
                onChange={handleChange}
                helperText="European Article Number (optional)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Product Name"
                name="name"
                value={values.name}
                onChange={handleNameChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Slug"
                name="slug"
                value={values.slug}
                onChange={handleChange}
                error={!!errors.slug}
                helperText={
                  errors.slug ||
                  "URL-friendly identifier (e.g., my-product-name)"
                }
              />
            </Grid>

            {/* Pricing & Inventory */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                Pricing & Inventory
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Price"
                name="price"
                value={values.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Stock"
                name="stock"
                value={values.stock}
                onChange={handleChange}
                error={!!errors.stock}
                helperText={errors.stock}
                disabled={values.is_always_in_stock}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_always_in_stock"
                    checked={values.is_always_in_stock}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "is_always_in_stock",
                          value: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Always in Stock"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Per Buy"
                name="max_per_buy"
                value={values.max_per_buy}
                onChange={handleChange}
                helperText="Maximum quantity per purchase (optional)"
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Product Details */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                Product Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Weight"
                name="weight"
                value={values.weight}
                onChange={handleChange}
                helperText="Weight in kg (optional)"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Units Per Package"
                name="units_per_package"
                value={values.units_per_package}
                onChange={handleChange}
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Category & Brand */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                Category & Brand
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.category_id}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category_id"
                  value={values.category_id}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.parent_id && "— "}
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category_id && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 1.5 }}
                  >
                    {errors.category_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Brand</InputLabel>
                <Select
                  name="brand_id"
                  value={values.brand_id}
                  onChange={handleChange}
                  label="Brand"
                >
                  <MenuItem value="">
                    <em>Select a brand (optional)</em>
                  </MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Image */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                Image
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="image_url"
                value={values.image_url}
                onChange={handleChange}
                helperText="URL of the product image (optional)"
              />
            </Grid>

            {values.image_url && (
              <Grid item xs={12}>
                <Box
                  component="img"
                  src={values.image_url}
                  alt="Product preview"
                  sx={{
                    maxWidth: 200,
                    maxHeight: 200,
                    objectFit: "contain",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </Grid>
            )}

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SaveOutlined />}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Product"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/admin/products")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProductPage;
