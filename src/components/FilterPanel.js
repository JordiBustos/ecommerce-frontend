import { Box, Paper, Typography, Button, Grid } from "@mui/material";
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * Reusable filter panel component for admin pages
 * Provides a consistent filter UI with header and clear button
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Filter form fields to display
 * @param {boolean} props.hasActiveFilters - Whether any filters are active
 * @param {Function} props.onClearFilters - Callback when clear filters is clicked
 * @param {React.ReactNode} [props.resultsInfo] - Optional results count/info to display
 */
const FilterPanel = ({ 
  children, 
  hasActiveFilters, 
  onClearFilters,
  resultsInfo 
}) => {
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FilterListIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Filters
        </Typography>
        {hasActiveFilters && (
          <Button
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            size="small"
            color="secondary"
          >
            Clear Filters
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {children}
      </Grid>

      {resultsInfo && (
        <Box sx={{ mt: 2 }}>
          {resultsInfo}
        </Box>
      )}
    </Paper>
  );
};

FilterPanel.propTypes = {
  children: PropTypes.node.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  resultsInfo: PropTypes.node,
};

export default FilterPanel;
