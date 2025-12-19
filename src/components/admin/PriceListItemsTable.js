import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

/**
 * Table component for displaying price list items with search
 */
const PriceListItemsTable = ({
  items,
  products,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    
    return items.filter((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return product?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [items, products, searchQuery]);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddItem}
          variant="outlined"
        >
          Add Product
        </Button>
        
        <TextField
          size="small"
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
      </Box>

      {filteredItems.length > 0 ? (
        <Paper sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Product ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center" width={120}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_id}</TableCell>
                    <TableCell>{product?.name || "Unknown"}</TableCell>
                    <TableCell align="right">
                      ${parseFloat(item.price).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEditItem(item)}
                          title="Edit price"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteItem(item.id)}
                          title="Remove product"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Typography color="text.secondary">
          {searchQuery ? "No products match your search" : "No products added"}
        </Typography>
      )}
    </Box>
  );
};

PriceListItemsTable.propTypes = {
  items: PropTypes.array.isRequired,
  products: PropTypes.array.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onEditItem: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
};

export default PriceListItemsTable;
