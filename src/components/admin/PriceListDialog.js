import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

/**
 * Dialog for creating/editing a price list
 */
const PriceListDialog = ({ open, onClose, onSave, formData, setFormData, isEditing }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? "Edit Price List" : "New Price List"}</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          fullWidth
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          margin="dense"
          size="small"
        />
        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          margin="dense"
          size="small"
          multiline
          rows={3}
        />
        <TextField
          fullWidth
          label="Role Filter"
          value={formData.role_filter}
          onChange={(e) => setFormData({ ...formData, role_filter: e.target.value })}
          margin="dense"
          size="small"
          placeholder="e.g., vip, wholesale"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
          }
          label="Active"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PriceListDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

export default PriceListDialog;
