import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  MenuItem,
  Divider,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import productService from "../../../services/productService";
import { useCategories } from "../../../contexts/CategoriesContext";
import { useForm } from "../../../hooks";

/**
 * Admin page to edit product details
 */
const AdminEditProductPage = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { categoriesFlat } = useCategories();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState([]);
  const [product, setProduct] = useState(null);

  const { values, errors, handleChange, setFormValues, handleSubmit } = useForm(
    {
      sku: "",
      ean: "",
      name: "",
      description: "",
      price: 0,
      stock: 0,
      is_always_in_stock: false,
      max_per_buy: 0,
      weight: 0,
      units_per_package: 1,
      category_id: "",
      brand_id: "",
      image_url: "",
      slug: "",
      is_active: true,
    },
    handleSaveProduct,
    validateForm
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlug]);

  /**
   * Load product and brands (categories from context)
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [productData, brandsData] = await Promise.all([
        productService.getProductBySlug(productSlug),
        productService.getBrands(),
      ]);

      setProduct(productData);
      setBrands(brandsData);

      // Set form values from product data
      setFormValues({
        sku: productData.sku || "",
        ean: productData.ean || "",
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price || 0,
        stock: productData.stock || 0,
        is_always_in_stock: productData.is_always_in_stock || false,
        max_per_buy: productData.max_per_buy || 0,
        weight: productData.weight || 0,
        units_per_package: productData.units_per_package || 1,
        category_id: productData.category_id || "",
        brand_id: productData.brand_id || "",
        image_url: productData.image_url || "",
        slug: productData.slug || "",
        is_active:
          productData.is_active !== undefined ? productData.is_active : true,
      });
    } catch (error) {
      enqueueSnackbar("Failed to load product details", { variant: "error" });
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate form
   */
  function validateForm(values) {
    const errors = {};

    if (!values.name || values.name.trim() === "") {
      errors.name = "Product name is required";
    }

    if (!values.price || values.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (!values.slug || values.slug.trim() === "") {
      errors.slug = "Slug is required";
    }

    if (values.max_per_buy && values.max_per_buy <= 0) {
      errors.max_per_buy = "Max per buy must be greater than 0";
    }

    if (values.stock < 0) {
      errors.stock = "Stock cannot be negative";
    }

    return errors;
  }

  /**
   * Handle save product
   */
  async function handleSaveProduct(formValues) {
    try {
      setSaving(true);

      // Prepare data for API
      const updateData = {
        sku: formValues.sku || null,
        ean: formValues.ean || null,
        name: formValues.name,
        description: formValues.description || null,
        price: parseFloat(formValues.price),
        stock: parseInt(formValues.stock, 10),
        is_always_in_stock: formValues.is_always_in_stock,
        max_per_buy: formValues.max_per_buy
          ? parseInt(formValues.max_per_buy, 10)
          : null,
        weight: formValues.weight ? parseFloat(formValues.weight) : null,
        units_per_package: formValues.units_per_package
          ? parseInt(formValues.units_per_package, 10)
          : 1,
        category_id: formValues.category_id
          ? parseInt(formValues.category_id, 10)
          : null,
        brand_id: formValues.brand_id
          ? parseInt(formValues.brand_id, 10)
          : null,
        image_url: formValues.image_url || null,
        slug: formValues.slug,
        is_active: formValues.is_active,
      };

      await productService.updateProduct(product.slug, updateData);
      enqueueSnackbar("Product updated successfully", { variant: "success" });
      navigate("/admin/products");
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.detail || "Failed to update product",
        { variant: "error" }
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Handle switch changes
   */
  const handleSwitchChange = (event) => {
    handleChange({
      target: {
        name: event.target.name,
        value: event.target.checked,
      },
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

  if (!product) {
    return null;
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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Edit Product
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update product information - {product?.name || "Loading..."}
        </Typography>
      </Box>

      {/* Form */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Slug"
                name="slug"
                value={values.slug}
                onChange={handleChange}
                error={!!errors.slug}
                helperText={errors.slug || "URL-friendly identifier"}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
              />
            </Grid>

            {/* Product Codes */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Product Codes
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={values.sku}
                onChange={handleChange}
                helperText="Stock Keeping Unit"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="EAN"
                name="ean"
                value={values.ean}
                onChange={handleChange}
                helperText="European Article Number"
              />
            </Grid>

            {/* Pricing & Stock */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Pricing & Stock
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                name="price"
                value={values.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                inputProps={{ min: 0, step: 0.01 }}
                required
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
                inputProps={{ min: 0 }}
                disabled={values.is_always_in_stock}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max per Buy"
                name="max_per_buy"
                value={values.max_per_buy}
                onChange={handleChange}
                error={!!errors.max_per_buy}
                helperText={
                  errors.max_per_buy ||
                  "Maximum quantity per order (0 = no limit)"
                }
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.is_always_in_stock}
                    onChange={handleSwitchChange}
                    name="is_always_in_stock"
                    color="primary"
                  />
                }
                label="Always in Stock"
              />
            </Grid>

            {/* Physical Properties */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Physical Properties
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Weight (kg)"
                name="weight"
                value={values.weight}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Units per Package"
                name="units_per_package"
                value={values.units_per_package}
                onChange={handleChange}
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Category & Brand */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Classification
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category_id"
                value={values.category_id}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categoriesFlat.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {"\u00A0\u00A0\u00A0".repeat(category.depth)}
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Brand"
                name="brand_id"
                value={values.brand_id}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Media */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Media
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="image_url"
                value={values.image_url}
                onChange={handleChange}
                helperText="URL of the product image"
              />
            </Grid>

            {values.image_url && (
              <Grid item xs={12}>
                <Box
                  component="img"
                  src={values.image_url}
                  alt="Product preview"
                  sx={{
                    width: "100%",
                    maxWidth: 300,
                    height: "auto",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </Grid>
            )}

            {/* Status */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.is_active}
                    onChange={handleSwitchChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label="Product Active"
              />
              <Alert severity="info" sx={{ mt: 2 }}>
                Inactive products will not be visible to customers
              </Alert>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/admin/products")}
                  disabled={saving}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    saving ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  disabled={saving}
                  fullWidth
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AdminEditProductPage;
