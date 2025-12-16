import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
} from "@mui/material";
import {
  LocalOfferOutlined,
  AddOutlined,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { DataTable, PageHeader } from "../../components";
import productService from "../../services/productService";

/**
 * Admin page to manage brands
 */
const AdminBrandsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    logo_url: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await productService.getBrands();
      setBrands(data);
    } catch (err) {
      const errorMsg = "Failed to load brands";
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name || "",
        description: brand.description || "",
        slug: brand.slug || "",
        logo_url: brand.logo_url || "",
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: "",
        description: "",
        slug: "",
        logo_url: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBrand(null);
    setFormData({
      name: "",
      description: "",
      slug: "",
      logo_url: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      enqueueSnackbar("Name is required", { variant: "error" });
      return;
    }

    try {
      setSubmitting(true);

      if (editingBrand) {
        await productService.updateBrand(editingBrand.id, formData);
        enqueueSnackbar("Brand updated successfully", { variant: "success" });
      } else {
        await productService.createBrand(formData);
        enqueueSnackbar("Brand created successfully", { variant: "success" });
      }

      handleCloseDialog();
      loadBrands();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.detail || `Failed to ${editingBrand ? "update" : "create"} brand`,
        { variant: "error" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (brand) => {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBrandToDelete(null);
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;

    try {
      await productService.deleteBrand(brandToDelete.id);
      enqueueSnackbar("Brand deleted successfully", { variant: "success" });
      handleCloseDeleteDialog();
      loadBrands();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.detail || "Failed to delete brand",
        { variant: "error" }
      );
    }
  };

  const columns = [
    {
      field: "id",
      header: "ID",
      render: (row) => `#${row.id}`,
    },
    {
      field: "name",
      header: "Name",
      sortable: true,
    },
    {
      field: "slug",
      header: "Slug",
      render: (row) => (
        <Chip label={row.slug || "N/A"} size="small" variant="outlined" />
      ),
    },
    {
      field: "description",
      header: "Description",
      render: (row) =>
        row.description
          ? row.description.length > 50
            ? `${row.description.substring(0, 50)}...`
            : row.description
          : "-",
    },
    {
      field: "logo_url",
      header: "Logo",
      render: (row) =>
        row.logo_url ? (
          <img
            src={row.logo_url}
            alt={row.name}
            style={{ height: 30, objectFit: "contain" }}
          />
        ) : (
          "-"
        ),
    },
    {
      field: "actions",
      header: "Actions",
      render: (row) => (
        <>
          <IconButton
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(row);
            }}
            size="small"
            title="Edit brand"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDeleteDialog(row);
            }}
            size="small"
            title="Delete brand"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Brands"
        description="Manage product brands"
        action={
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenDialog()}
          >
            Add Brand
          </Button>
        }
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <DataTable
        columns={columns}
        data={brands}
        loading={loading}
        emptyState={{
          icon: LocalOfferOutlined,
          iconColor: "primary.main",
          title: "No Brands Found",
          description: "Create your first brand to get started.",
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBrand ? "Edit Brand" : "Create New Brand"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                helperText="URL-friendly version of the name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Logo URL"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {editingBrand ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Brand</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the brand "
            {brandToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminBrandsPage;
