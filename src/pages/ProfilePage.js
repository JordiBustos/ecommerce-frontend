import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useSnackbar } from "notistack";
import addressService from "../services/addressService";
import newsletterService from "../services/newsletterService";
import {
  validateEmail,
  validatePhone,
  validateDNI,
  validatePostalCode,
  parseAPIError,
} from "../utils/security";

/**
 * Profile page component
 */
const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    dni: "",
    birth_date: "",
    gender: "",
    phone_number: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    full_name: "",
    country: "",
    postal_code: "",
    province: "",
    city: "",
    address_line1: "",
    address_line2: "",
    phone_number: "",
    is_default: false,
  });

  /**
   * Load user addresses
   */
  const loadAddresses = useCallback(async () => {
    try {
      setAddressLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (error) {
      enqueueSnackbar("Failed to load addresses", { variant: "error" });
    } finally {
      setAddressLoading(false);
    }
  }, [enqueueSnackbar]);

  /**
   * Check newsletter subscription status
   */
  const checkNewsletterStatus = useCallback(async () => {
    try {
      const status = await newsletterService.getStatus();
      setNewsletterSubscribed(status.subscribed || false);
    } catch (error) {
      // User might not be subscribed yet
      setNewsletterSubscribed(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        full_name: user.full_name || "",
        dni: user.dni || "",
        birth_date: user.birth_date || "",
        gender: user.gender || "",
        phone_number: user.phone_number || "",
      });
    }
    loadAddresses();
    checkNewsletterStatus();
  }, [user, loadAddresses, checkNewsletterStatus]);

  /**
   * Handle newsletter subscription toggle
   */
  const handleNewsletterToggle = async (event) => {
    const subscribe = event.target.checked;

    try {
      setNewsletterLoading(true);
      if (subscribe) {
        await newsletterService.subscribe(user.email);
        enqueueSnackbar("Subscribed to newsletter successfully", {
          variant: "success",
        });
      } else {
        await newsletterService.unsubscribe(user.email);
        enqueueSnackbar("Unsubscribed from newsletter", { variant: "info" });
      }
      setNewsletterSubscribed(subscribe);
    } catch (error) {
      enqueueSnackbar("Failed to update newsletter subscription", {
        variant: "error",
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  /**
   * Handle input change
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSuccess(false);
    setError("");
  };

  /**
   * Handle form submission
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    // Validate email
    if (formData.email && !validateEmail(formData.email)) {
      setError("Invalid email address");
      enqueueSnackbar("Invalid email address", { variant: "error" });
      setLoading(false);
      return;
    }

    // Validate phone number
    if (formData.phone_number && !validatePhone(formData.phone_number)) {
      setError("Invalid phone number");
      enqueueSnackbar("Invalid phone number", { variant: "error" });
      setLoading(false);
      return;
    }

    // Validate DNI
    if (formData.dni && !validateDNI(formData.dni)) {
      setError("Invalid DNI format");
      enqueueSnackbar("Invalid DNI format", { variant: "error" });
      setLoading(false);
      return;
    }

    try {
      await updateUser(formData);
      setSuccess(true);
      enqueueSnackbar("Profile updated successfully", { variant: "success" });
    } catch (err) {
      const errorMsg = parseAPIError(err, "Failed to update profile");
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle address dialog open
   * @param {Object|null} address - Address to edit or null for new address
   */
  const handleAddressDialogOpen = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressFormData({
        full_name: address.full_name || "",
        country: address.country || "",
        postal_code: address.postal_code || "",
        province: address.province || "",
        city: address.city || "",
        address_line1: address.address_line1 || "",
        address_line2: address.address_line2 || "",
        phone_number: address.phone_number || "",
        is_default: address.is_default || false,
      });
    } else {
      setEditingAddress(null);
      setAddressFormData({
        full_name: user?.full_name || "",
        country: "",
        postal_code: "",
        province: "",
        city: "",
        address_line1: "",
        address_line2: "",
        phone_number: user?.phone_number || "",
        is_default: false,
      });
    }
    setAddressDialogOpen(true);
  };

  /**
   * Handle address dialog close
   */
  const handleAddressDialogClose = () => {
    setAddressDialogOpen(false);
    setEditingAddress(null);
  };

  /**
   * Handle address form change
   */
  const handleAddressFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setAddressFormData({
      ...addressFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /**
   * Handle address submit
   */
  const handleAddressSubmit = async () => {
    // Validate required fields
    if (!addressFormData.full_name?.trim()) {
      enqueueSnackbar("Full name is required", { variant: "error" });
      return;
    }

    if (!addressFormData.country?.trim()) {
      enqueueSnackbar("Country is required", { variant: "error" });
      return;
    }

    if (!addressFormData.postal_code?.trim()) {
      enqueueSnackbar("Postal code is required", { variant: "error" });
      return;
    }

    // Validate postal code format
    if (!validatePostalCode(addressFormData.postal_code)) {
      enqueueSnackbar("Invalid postal code format", { variant: "error" });
      return;
    }

    if (!addressFormData.city?.trim()) {
      enqueueSnackbar("City is required", { variant: "error" });
      return;
    }

    if (!addressFormData.address_line1?.trim()) {
      enqueueSnackbar("Address is required", { variant: "error" });
      return;
    }

    // Validate phone number
    if (
      addressFormData.phone_number &&
      !validatePhone(addressFormData.phone_number)
    ) {
      enqueueSnackbar("Invalid phone number format", { variant: "error" });
      return;
    }

    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, addressFormData);
        enqueueSnackbar("Address updated successfully", { variant: "success" });
      } else {
        await addressService.createAddress(addressFormData);
        enqueueSnackbar("Address added successfully", { variant: "success" });
      }
      await loadAddresses();
      handleAddressDialogClose();
    } catch (error) {
      const errorMsg = parseAPIError(error, "Failed to save address");
      enqueueSnackbar(errorMsg, { variant: "error" });
    }
  };

  /**
   * Handle address delete
   */
  const handleAddressDelete = (address) => {
    setAddressToDelete(address);
    setDeleteConfirmOpen(true);
  };

  /**
   * Confirm address deletion
   */
  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      await addressService.deleteAddress(addressToDelete.id);
      enqueueSnackbar("Address deleted successfully", { variant: "success" });
      await loadAddresses();
    } catch (error) {
      enqueueSnackbar("Failed to delete address", { variant: "error" });
    } finally {
      setDeleteConfirmOpen(false);
      setAddressToDelete(null);
    }
  };

  /**
   * Cancel address deletion
   */
  const cancelDeleteAddress = () => {
    setDeleteConfirmOpen(false);
    setAddressToDelete(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        My Profile
      </Typography>

      {/* Personal Information */}
      <Paper sx={{ p: 4, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Personal Information
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DNI"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={loading}
                placeholder="+34 600 000 000"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Birth Date"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Update Profile"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Addresses Section */}
      <Paper sx={{ p: 4, mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5">Addresses</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddressDialogOpen()}
          >
            Add Address
          </Button>
        </Box>

        {addressLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : addresses.length === 0 ? (
          <Alert severity="info">
            No addresses found. Add your first address to get started.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {addresses.map((address) => (
              <Grid item xs={12} md={6} key={address.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        {address.is_default && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "primary.main",
                              fontWeight: 600,
                              mb: 1,
                              display: "block",
                            }}
                          >
                            DEFAULT
                          </Typography>
                        )}
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {address.full_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.address_line1}
                        </Typography>
                        {address.address_line2 && (
                          <Typography variant="body2" color="text.secondary">
                            {address.address_line2}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {address.city}, {address.province}{" "}
                          {address.postal_code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.country}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          📞 {address.phone_number}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleAddressDialogOpen(address)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleAddressDelete(address)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Account Details */}
      <Paper sx={{ p: 4, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Account Details
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user?.id}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Username
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user?.username}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Account Status
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: user?.is_active ? "success.main" : "error.main",
                }}
              >
                {user?.is_active ? "Active" : "Inactive"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Account Type
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user?.is_superuser ? "Admin" : "Regular User"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user?.updated_at
                  ? new Date(user.updated_at).toLocaleDateString()
                  : "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Address Dialog */}
      <Dialog
        open={addressDialogOpen}
        onClose={handleAddressDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingAddress ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={addressFormData.full_name}
                  onChange={handleAddressFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  name="address_line1"
                  value={addressFormData.address_line1}
                  onChange={handleAddressFormChange}
                  required
                  placeholder="Street address, P.O. box, company name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 2 (Optional)"
                  name="address_line2"
                  value={addressFormData.address_line2}
                  onChange={handleAddressFormChange}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={addressFormData.city}
                  onChange={handleAddressFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Province"
                  name="province"
                  value={addressFormData.province}
                  onChange={handleAddressFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="postal_code"
                  value={addressFormData.postal_code}
                  onChange={handleAddressFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={addressFormData.country}
                  onChange={handleAddressFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={addressFormData.phone_number}
                  onChange={handleAddressFormChange}
                  required
                  placeholder="+34 600 000 000"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={addressFormData.is_default}
                    onChange={handleAddressFormChange}
                    style={{ marginRight: 8 }}
                  />
                  <label htmlFor="is_default">
                    <Typography variant="body2">
                      Set as default address
                    </Typography>
                  </label>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddressDialogClose}>Cancel</Button>
          <Button onClick={handleAddressSubmit} variant="contained">
            {editingAddress ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={cancelDeleteAddress}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DeleteIcon color="error" />
            <Typography variant="h6">Delete Address</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this address?
          </Typography>
          {addressToDelete && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {addressToDelete.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {addressToDelete.address_line1}
              </Typography>
              {addressToDelete.address_line2 && (
                <Typography variant="body2" color="text.secondary">
                  {addressToDelete.address_line2}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {addressToDelete.city}, {addressToDelete.province}{" "}
                {addressToDelete.postal_code}
              </Typography>
            </Paper>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelDeleteAddress} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteAddress}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Account Settings Section */}
      <Paper sx={{ p: 4, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Account Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={newsletterSubscribed}
                onChange={handleNewsletterToggle}
                disabled={newsletterLoading}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Newsletter Subscription</Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive updates about new products, exclusive discounts, and
                  more
                </Typography>
              </Box>
            }
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
