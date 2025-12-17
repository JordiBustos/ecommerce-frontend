import { useState, useEffect, useMemo, useCallback } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Avatar,
} from "@mui/material";
import {
  PeopleOutlined,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { DataTable, PageHeader, FilterPanel } from "../../components";
import userService from "../../services/userService";
import roleService from "../../services/roleService";

/**
 * Admin page to manage users and their roles
 */
const AdminUsersPage = () => {
  const { enqueueSnackbar } = useSnackbar();

  // State
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      const errorMsg = "Failed to load users";
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const loadRoles = useCallback(async () => {
    try {
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Failed to load roles:", err);
    }
  }, []);

  const loadUsersByRole = useCallback(
    async (roleId) => {
      try {
        setLoading(true);
        setError("");
        const data = await roleService.getUsersWithRole(roleId);

        const enrichedUsers = data.map((user) => {
          if (user.roles && Array.isArray(user.roles)) {
            const roleObjects = user.roles
              .map((roleSlug) => {
                return roles.find((r) => r.slug === roleSlug);
              })
              .filter(Boolean);

            return { ...user, roles: roleObjects };
          }
          return { ...user, roles: [] };
        });

        setUsers(enrichedUsers);
      } catch (err) {
        const errorMsg = "Failed to load users by role";
        setError(errorMsg);
        enqueueSnackbar(errorMsg, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, roles]
  );

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [loadUsers, loadRoles]);

  const handleRoleFilterChange = useCallback(
    (roleId) => {
      setSelectedRoleFilter(roleId);
      if (roleId) {
        loadUsersByRole(roleId);
      } else {
        loadUsers();
      }
    },
    [loadUsers, loadUsersByRole]
  );

  const handleClearFilters = useCallback(() => {
    setSelectedRoleFilter("");
    loadUsers();
  }, [loadUsers]);

  const handleOpenEditDialog = useCallback((user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      is_active: user.is_active !== undefined ? user.is_active : true,
    });
    setEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setEditingUser(null);
    setFormData({
      full_name: "",
      email: "",
      is_active: true,
    });
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.email.trim()) {
      enqueueSnackbar("Email is required", { variant: "error" });
      return;
    }

    try {
      setSubmitting(true);
      await userService.updateProfile(formData);
      enqueueSnackbar("User updated successfully", { variant: "success" });
      handleCloseEditDialog();
      loadUsers();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.detail || "Failed to update user", {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    formData,
    editingUser,
    enqueueSnackbar,
    handleCloseEditDialog,
    loadUsers,
  ]);

  const handleOpenRoleDialog = useCallback((user) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  }, []);

  const handleCloseRoleDialog = useCallback(() => {
    setRoleDialogOpen(false);
    setSelectedUser(null);
  }, []);

  const handleAssignRole = useCallback(
    async (roleId) => {
      if (!selectedUser) return;

      try {
        await roleService.assignRoleToUser(roleId, selectedUser.id);
        enqueueSnackbar("Role assigned successfully", { variant: "success" });
        loadUsers();
      } catch (err) {
        enqueueSnackbar(err.response?.data?.detail || "Failed to assign role", {
          variant: "error",
        });
      }
    },
    [selectedUser, enqueueSnackbar, loadUsers]
  );

  const handleRemoveRole = useCallback(
    async (roleId) => {
      if (!selectedUser) return;

      try {
        await roleService.removeRoleFromUser(roleId, selectedUser.id);
        enqueueSnackbar("Role removed successfully", { variant: "success" });
        loadUsers();
      } catch (err) {
        enqueueSnackbar(err.response?.data?.detail || "Failed to remove role", {
          variant: "error",
        });
      }
    },
    [selectedUser, enqueueSnackbar, loadUsers]
  );

  const columns = useMemo(
    () => [
      {
        field: "id",
        header: "ID",
        render: (row) => <Chip label={row.id} size="small" />,
      },
      {
        field: "user",
        header: "User",
        render: (row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
              {row.full_name?.[0]?.toUpperCase() || row.email[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {row.full_name || "—"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.email}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: "roles",
        header: "Roles",
        render: (row) => {
          const userRoles = row.roles || [];

          return (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {userRoles.length > 0 ? (
                userRoles.map((role) => (
                  <Chip
                    key={role.id}
                    label={role.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                    icon={<AdminIcon />}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No roles
                </Typography>
              )}
            </Box>
          );
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
        field: "is_superuser",
        header: "Admin",
        render: (row) =>
          row.is_superuser ? (
            <Chip label="Superuser" size="small" color="error" />
          ) : null,
      },
      {
        field: "created_at",
        header: "Joined",
        render: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.created_at
              ? new Date(row.created_at).toLocaleDateString()
              : "—"}
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
              onClick={() => handleOpenEditDialog(row)}
              title="Edit user"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleOpenRoleDialog(row)}
              title="Manage roles"
            >
              <PersonAddIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [handleOpenEditDialog, handleOpenRoleDialog]
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        title="Users Management"
        description="Manage users and their roles"
        icon={<PeopleOutlined sx={{ fontSize: 40 }} />}
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Filters */}
      <FilterPanel
        hasActiveFilters={!!selectedRoleFilter}
        onClearFilters={handleClearFilters}
        resultsInfo={
          <Typography variant="body2" color="text.secondary">
            Showing {users.length} user{users.length !== 1 ? "s" : ""}
            {selectedRoleFilter && " with selected role"}
          </Typography>
        }
      >
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={selectedRoleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              label="Filter by Role"
            >
              <MenuItem value="">
                <em>All Users</em>
              </MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyState={{
          icon: PeopleOutlined,
          title: "No users found",
          description: selectedRoleFilter
            ? "No users with the selected role"
            : "No users registered yet",
        }}
      />

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={handleCloseRoleDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Manage Roles for {selectedUser?.full_name || selectedUser?.email}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Available Roles
            </Typography>
            <Grid container spacing={2}>
              {roles.map((role) => {
                const userRoleIds = selectedUser && selectedUser.roles
                  ? selectedUser.roles.map((r) => r.id)
                  : [];
                const hasRole = userRoleIds.includes(role.id);

                return (
                  <Grid item xs={12} key={role.id}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        border: "1px solid",
                        borderColor: hasRole ? "primary.main" : "divider",
                        borderRadius: 1,
                        bgcolor: hasRole ? "primary.50" : "transparent",
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {role.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description || role.slug}
                        </Typography>
                      </Box>
                      {hasRole ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CloseIcon />}
                          onClick={() => handleRemoveRole(role.id)}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PersonAddIcon />}
                          onClick={() => handleAssignRole(role.id)}
                        >
                          Assign
                        </Button>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsersPage;
