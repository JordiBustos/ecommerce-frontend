import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Autocomplete,
} from '@mui/material';
import {
  LocalOffer as CouponIcon,
  AddOutlined,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, PageHeader } from '../../../components';
import couponService from '../../../services/couponService';
import userService from '../../../services/userService';
import { useForm } from '../../../hooks';

/**
 * Admin page to manage coupons
 */
const AdminCouponsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const initialValues = {
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_uses: 1,
    max_uses_per_user: 1,
    is_active: true,
    valid_from: '',
    valid_to: '',
  };

  const { values, errors, handleChange, setFormValues, resetForm, handleSubmit } = useForm(
    initialValues,
    handleSaveCoupon,
    validateForm
  );

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.getCoupons();
      setCoupons(data.coupons || []);
    } catch (error) {
      enqueueSnackbar('Failed to load coupons', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  useEffect(() => {
    loadCoupons();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validateForm(values) {
    const errors = {};

    if (!values.code?.trim()) {
      errors.code = 'Code is required';
    }

    if (!values.discount_value || values.discount_value <= 0) {
      errors.discount_value = 'Discount value must be greater than 0';
    }

    if (values.discount_type === 'percentage' && values.discount_value > 100) {
      errors.discount_value = 'Percentage cannot exceed 100%';
    }

    if (!values.valid_from) {
      errors.valid_from = 'Start date is required';
    }

    if (!values.valid_to) {
      errors.valid_to = 'End date is required';
    }

    if (values.valid_from && values.valid_to && values.valid_from > values.valid_to) {
      errors.valid_to = 'End date must be after start date';
    }

    return errors;
  }

  async function handleSaveCoupon(formValues) {
    try {
      setSubmitting(true);

      const couponData = {
        ...formValues,
        discount_value: parseFloat(formValues.discount_value),
        min_order_amount: parseFloat(formValues.min_order_amount) || 0,
        max_uses: parseInt(formValues.max_uses) || 1,
        max_uses_per_user: parseInt(formValues.max_uses_per_user) || 1,
        valid_from: new Date(formValues.valid_from).toISOString(),
        valid_to: new Date(formValues.valid_to).toISOString(),
        assigned_user_ids: selectedUsers.map((u) => u.id),
      };

      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, couponData);
        enqueueSnackbar('Coupon updated successfully', { variant: 'success' });
      } else {
        await couponService.createCoupon(couponData);
        enqueueSnackbar('Coupon created successfully', { variant: 'success' });
      }

      setDialogOpen(false);
      setEditingCoupon(null);
      resetForm();
      setSelectedUsers([]);
      loadCoupons();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to save coupon', {
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormValues({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_uses: coupon.max_uses,
      max_uses_per_user: coupon.max_uses_per_user,
      is_active: coupon.is_active,
      valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
      valid_to: coupon.valid_to ? coupon.valid_to.split('T')[0] : '',
    });
    setSelectedUsers(
      coupon.assigned_users?.map((userId) => users.find((u) => u.id === userId)).filter(Boolean) || []
    );
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;

    try {
      await couponService.deleteCoupon(couponToDelete.id);
      enqueueSnackbar('Coupon deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
      loadCoupons();
    } catch (error) {
      enqueueSnackbar('Failed to delete coupon', { variant: 'error' });
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setEditingCoupon(null);
    setSelectedUsers([]);
    setDialogOpen(true);
  };

  const columns = [
    {
      field: 'code',
      header: 'Code',
      render: (row) => (
        <Chip
          label={row.code}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600, fontFamily: 'monospace' }}
        />
      ),
    },
    {
      field: 'description',
      header: 'Description',
      render: (row) => (
        <Typography variant="body2" sx={{ maxWidth: 250 }}>
          {row.description || '-'}
        </Typography>
      ),
    },
    {
      field: 'discount',
      header: 'Discount',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.discount_type === 'percentage'
            ? `${row.discount_value}%`
            : `$${row.discount_value.toFixed(2)}`}
        </Typography>
      ),
    },
    {
      field: 'usage',
      header: 'Usage',
      render: (row) => (
        <Typography variant="body2">
          {row.current_uses} / {row.max_uses || '∞'}
        </Typography>
      ),
    },
    {
      field: 'valid_from',
      header: 'Valid Period',
      render: (row) => (
        <Box>
          <Typography variant="caption" display="block">
            From: {new Date(row.valid_from).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" display="block">
            To: {new Date(row.valid_to).toLocaleDateString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'is_active',
      header: 'Status',
      render: (row) =>
        row.is_active ? (
          <Chip icon={<ActiveIcon />} label="Active" color="success" size="small" />
        ) : (
          <Chip icon={<InactiveIcon />} label="Inactive" color="default" size="small" />
        ),
    },
    {
      field: 'actions',
      header: 'Actions',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" color="primary" onClick={() => handleEdit(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setCouponToDelete(row);
              setDeleteDialogOpen(true);
            }}
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
        icon={CouponIcon}
        title="Coupons Management"
        description="Create and manage discount coupons"
        action={
          <Button variant="contained" startIcon={<AddOutlined />} onClick={handleOpenDialog}>
            Create Coupon
          </Button>
        }
      />

      <Paper elevation={2} sx={{ mt: 3 }}>
        <DataTable
          columns={columns}
          data={coupons}
          loading={loading}
          emptyState={{
            icon: CouponIcon,
            title: 'No Coupons',
            description: 'Create your first coupon to get started',
          }}
        />
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Coupon Code"
                  name="code"
                  value={values.code}
                  onChange={handleChange}
                  error={!!errors.code}
                  helperText={errors.code || 'Uppercase letters and numbers recommended'}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Discount Type"
                  name="discount_type"
                  value={values.discount_type}
                  onChange={handleChange}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label={values.discount_type === 'percentage' ? 'Discount (%)' : 'Discount Amount'}
                  name="discount_value"
                  value={values.discount_value}
                  onChange={handleChange}
                  error={!!errors.discount_value}
                  helperText={errors.discount_value}
                  inputProps={{ min: 0, max: values.discount_type === 'percentage' ? 100 : undefined, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Order Amount"
                  name="min_order_amount"
                  value={values.min_order_amount}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Uses (Total)"
                  name="max_uses"
                  value={values.max_uses}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Uses Per User"
                  name="max_uses_per_user"
                  value={values.max_uses_per_user}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Valid From"
                  name="valid_from"
                  value={values.valid_from}
                  onChange={handleChange}
                  error={!!errors.valid_from}
                  helperText={errors.valid_from}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Valid To"
                  name="valid_to"
                  value={values.valid_to}
                  onChange={handleChange}
                  error={!!errors.valid_to}
                  helperText={errors.valid_to}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={users}
                  getOptionLabel={(option) => `${option.email} (ID: ${option.id})`}
                  value={selectedUsers}
                  onChange={(event, newValue) => setSelectedUsers(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assign to Specific Users (optional)"
                      helperText="Leave empty to make coupon available to all users"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.is_active}
                      onChange={(e) =>
                        handleChange({
                          target: { name: 'is_active', value: e.target.checked },
                        })
                      }
                      name="is_active"
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Coupon</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the coupon <strong>{couponToDelete?.code}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCouponsPage;
