import { Chip } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Get status color based on order status
 * @param {string} status - Order status
 * @returns {string} MUI color name
 */
const getStatusColor = (status) => {
  const statusColors = {
    pending: "warning",
    processing: "info",
    shipped: "primary",
    delivered: "success",
    cancelled: "error",
  };
  return statusColors[status?.toLowerCase()] || "default";
};

/**
 * Reusable status chip component for displaying order status
 * Provides consistent status colors across the application
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Order status to display
 * @param {string} [props.size='small'] - Chip size
 * @param {Object} [props.sx] - Additional styles
 */
const StatusChip = ({ status, size = "small", sx = {} }) => {
  return (
    <Chip
      label={status || "Unknown"}
      color={getStatusColor(status)}
      size={size}
      sx={sx}
    />
  );
};

StatusChip.propTypes = {
  status: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium"]),
  sx: PropTypes.object,
};

export default StatusChip;
