import { useState, useEffect, useMemo } from "react";
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
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import {
  CategoryOutlined,
  AddOutlined,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { PageHeader } from "../../components";
import productService from "../../services/productService";

/**
 * Admin page to manage categories with hierarchical tree view
 */
const AdminCategoriesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    image_url: "",
    parent_id: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Build hierarchical tree structure from flat categories array
   */
  const categoryTree = useMemo(() => {
    const buildTree = (parentId = null) => {
      return categories
        .filter((cat) => cat.parent_id === parentId)
        .map((cat) => ({
          ...cat,
          children: buildTree(cat.id),
        }));
    };
    return buildTree(null);
  }, [categories]);

  /**
   * Toggle category expansion
   */
  const toggleExpand = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await productService.getCategories();
      setCategories(data);
    } catch (err) {
      const errorMsg = "Failed to load categories";
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
        slug: category.slug || "",
        image_url: category.image_url || "",
        parent_id: category.parent_id || null,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        slug: "",
        image_url: "",
        parent_id: null,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      slug: "",
      image_url: "",
      parent_id: null,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "parent_id" ? (value === "" ? null : parseInt(value)) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      enqueueSnackbar("Name is required", { variant: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const dataToSubmit = {
        ...formData,
        parent_id: formData.parent_id || null,
      };

      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, dataToSubmit);
        enqueueSnackbar("Category updated successfully", {
          variant: "success",
        });
      } else {
        await productService.createCategory(dataToSubmit);
        enqueueSnackbar("Category created successfully", {
          variant: "success",
        });
      }

      handleCloseDialog();
      loadCategories();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.detail ||
          `Failed to ${editingCategory ? "update" : "create"} category`,
        { variant: "error" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await productService.deleteCategory(categoryToDelete.id);
      enqueueSnackbar("Category deleted successfully", { variant: "success" });
      handleCloseDeleteDialog();
      loadCategories();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.detail || "Failed to delete category",
        { variant: "error" }
      );
    }
  };

  /**
   * Recursive component to render category rows with hierarchy
   */
  const CategoryRow = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <>
        <TableRow
          hover
          sx={{
            backgroundColor:
              level > 0 ? `rgba(0, 0, 0, ${0.02 * level})` : "inherit",
          }}
        >
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", pl: level * 4 }}>
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={() => toggleExpand(category.id)}
                  sx={{ mr: 1 }}
                >
                  {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                </IconButton>
              ) : (
                <Box sx={{ width: 40, mr: 1 }} />
              )}
              <Typography
                variant="body2"
                sx={{ fontWeight: level === 0 ? 600 : 400 }}
              >
                {category.name}
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Typography variant="body2" color="text.secondary">
              {category.slug || "-"}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2" color="text.secondary">
              {category.description
                ? category.description.length > 60
                  ? `${category.description.substring(0, 60)}...`
                  : category.description
                : "-"}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2" color="text.secondary">
              {category.id}
            </Typography>
          </TableCell>
          <TableCell align="right">
            <IconButton
              color="primary"
              onClick={() => handleOpenDialog(category)}
              size="small"
              title="Edit category"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleOpenDeleteDialog(category)}
              size="small"
              title="Delete category"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && (
          <>
            {category.children.map((child) => (
              <CategoryRow key={child.id} category={child} level={level + 1} />
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Categories"
        description="Manage product categories"
        action={
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        }
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Typography>Loading categories...</Typography>
        </Box>
      ) : categories.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <CategoryOutlined
            sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            No Categories Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create your first category to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Category Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Slug</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  ID
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryTree.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? "Edit Category" : "Create New Category"}
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
                label="Image URL"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Parent Category"
                name="parent_id"
                value={formData.parent_id || ""}
                onChange={handleChange}
                helperText="Leave empty for top-level category"
              >
                <MenuItem value="">None (Top Level)</MenuItem>
                {categories
                  .filter((c) => c.id !== editingCategory?.id)
                  .sort((a, b) => {
                    if (a.parent_id === null && b.parent_id !== null) return -1;
                    if (a.parent_id !== null && b.parent_id === null) return 1;
                    return (a.name || "").localeCompare(b.name || "");
                  })
                  .map((category) => {
                    const isChild = category.parent_id !== null;
                    const displayName = isChild
                      ? `  └─ ${category.name}`
                      : category.name;
                    return (
                      <MenuItem key={category.id} value={category.id}>
                        {displayName}
                      </MenuItem>
                    );
                  })}
              </TextField>
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
            {editingCategory ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "
            {categoryToDelete?.name}"? This action cannot be undone.
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

export default AdminCategoriesPage;
