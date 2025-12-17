import { useState, useEffect, useCallback } from "react";
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
  Box,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  AddOutlined,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { DataTable, PageHeader } from "../../components";
import roleService from "../../services/roleService";

/**
 * Admin page to manage roles
 */
const AdminRolesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (err) {
      const errorMsg = "Failed to load roles";
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name || "",
        description: role.description || "",
        slug: role.slug || "",
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        slug: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      slug: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name if creating new role
    if (name === "name" && !editingRole) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      enqueueSnackbar("Name is required", { variant: "error" });
      return;
    }

    if (!formData.slug.trim()) {
      enqueueSnackbar("Slug is required", { variant: "error" });
      return;
    }

    try {
      setSubmitting(true);

      if (editingRole) {
        await roleService.updateRole(editingRole.id, formData);
        enqueueSnackbar("Role updated successfully", { variant: "success" });
      } else {
        await roleService.createRole(formData);
        enqueueSnackbar("Role created successfully", { variant: "success" });
      }

      handleCloseDialog();
      loadRoles();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.detail || `Failed to ${editingRole ? "update" : "create"} role`,
        { variant: "error" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      await roleService.deleteRole(roleToDelete.id);
      enqueueSnackbar("Role deleted successfully", { variant: "success" });
      handleCloseDeleteDialog();
      loadRoles();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.detail || "Failed to delete role",
        { variant: "error" }
      );
    }
  };

  const columns = [
    {
      field: "id",
      header: "ID",
      render: (row) => <Chip label={row.id} size="small" />,
    },
    {
      field: "name",
      header: "Name",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AdminPanelSettingsOutlined fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: "slug",
      header: "Slug",
      render: (row) => (
        <Chip
          label={row.slug}
          size="small"
          variant="outlined"
          sx={{ fontFamily: "monospace" }}
        />
      ),
    },
    {
      field: "description",
      header: "Description",
      render: (row) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.description || "—"}
        </Typography>
      ),
    },
    {
      field: "created_at",
      header: "Created",
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(row.created_at).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleOpenDialog(row)}
            title="Edit role"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleOpenDeleteDialog(row)}
            title="Delete role"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Roles Management"
        description="Manage user roles and permissions"
        icon={<AdminPanelSettingsOutlined sx={{ fontSize: 40 }} />}
        action={
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenDialog()}
          >
            Add Role
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
        data={roles}
        loading={loading}
        emptyState={{
          icon: AdminPanelSettingsOutlined,
          title: "No roles found",
          description: "Create your first role to manage user permissions",
          actionLabel: "Add Role",
          onAction: () => handleOpenDialog(),
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRole ? "Edit Role" : "Create New Role"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                helperText="Name of the role (e.g., Administrator, Editor)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                helperText="URL-friendly identifier (e.g., administrator, editor)"
                disabled={editingRole !== null}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                helperText="Optional description of the role's purpose"
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
            {submitting ? "Saving..." : editingRole ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
      >
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the role{" "}
            <strong>{roleToDelete?.name}</strong>? This action cannot be undone
            and may affect users assigned to this role.
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

export default AdminRolesPage;
