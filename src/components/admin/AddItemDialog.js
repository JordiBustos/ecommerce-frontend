import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

/**
 * Dialog for adding a product to a price list
 */
const AddItemDialog = ({ open, onClose, onSave, formData, setFormData, products }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Product to Price List</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <FormControl fullWidth size="small" margin="dense">
          <InputLabel>Product</InputLabel>
          <Select
            value={formData.product_id}
            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
            label="Product"
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Price"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          margin="dense"
          size="small"
          inputProps={{ min: 0, step: 0.01 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddItemDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
};

export default AddItemDialog;
