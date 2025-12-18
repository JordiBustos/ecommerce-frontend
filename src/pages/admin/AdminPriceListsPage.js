import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  DataTable,
  PageHeader,
  StatusChip,
  FilterPanel,
} from "../../components";
import PriceListDialog from "../../components/admin/PriceListDialog";
import AddItemDialog from "../../components/admin/AddItemDialog";
import EditItemDialog from "../../components/admin/EditItemDialog";
import PriceListItemsTable from "../../components/admin/PriceListItemsTable";
import priceListService from "../../services/priceListService";
import productService from "../../services/productService";

/**
 * Admin page to manage price lists
 */
const AdminPriceListsPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Data states
  const [priceLists, setPriceLists] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [filterActive, setFilterActive] = useState("");

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openEditItemDialog, setOpenEditItemDialog] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState(null);
  const [selectedPriceList, setSelectedPriceList] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    role_filter: "",
  });
  const [itemFormData, setItemFormData] = useState({
    product_id: "",
    price: "",
  });
  const [editItemFormData, setEditItemFormData] = useState({
    price: "",
  });

  /**
   * Load price lists and products
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [priceListsData, productsData] = await Promise.all([
        priceListService.getPriceLists(),
        productService.getProducts({ limit: 1000 }),
      ]);
      setPriceLists(priceListsData || []);
      
      // Handle different response structures
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else if (productsData?.products) {
        setProducts(productsData.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      enqueueSnackbar("Failed to load data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Filter price lists
   */
  const filteredPriceLists = useMemo(() => {
    return (priceLists || []).filter((pl) => {
      if (searchName && !pl.name.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }
      if (filterActive !== "" && pl.is_active !== (filterActive === "true")) {
        return false;
      }
      return true;
    });
  }, [priceLists, searchName, filterActive]);

  const totalPages = Math.ceil(filteredPriceLists.length / itemsPerPage);
  const paginatedPriceLists = filteredPriceLists.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const hasActiveFilters = searchName || filterActive !== "";

  /**
   * Handle add/edit price list
   */
  const handleSavePriceList = async () => {
    if (!formData.name.trim()) {
      enqueueSnackbar("Name is required", { variant: "error" });
      return;
    }

    try {
      if (editingPriceList) {
        await priceListService.updatePriceList(editingPriceList.id, formData);
        enqueueSnackbar("Price list updated", { variant: "success" });
      } else {
        await priceListService.createPriceList(formData);
        enqueueSnackbar("Price list created", { variant: "success" });
      }
      setOpenDialog(false);
      resetForm();
      loadData();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.detail || "Failed to save price list",
        { variant: "error" }
      );
    }
  };

  /**
   * Handle add item to price list
   */
  const handleSaveItem = async () => {
    if (!itemFormData.product_id || !itemFormData.price) {
      enqueueSnackbar("Product and price are required", { variant: "error" });
      return;
    }

    try {
      await priceListService.addItemToList(selectedPriceList.id, {
        product_id: parseInt(itemFormData.product_id, 10),
        price: parseFloat(itemFormData.price),
      });
      enqueueSnackbar("Product added to price list", { variant: "success" });
      setOpenItemDialog(false);
      setItemFormData({ product_id: "", price: "" });
      loadData();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.detail || "Failed to add product",
        { variant: "error" }
      );
    }
  };

  /**
   * Handle edit item
   */
  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditItemFormData({ price: item.price });
    setOpenEditItemDialog(true);
  };

  /**
   * Handle save edited item
   */
  const handleSaveEditItem = async () => {
    if (!editItemFormData.price) {
      enqueueSnackbar("Price is required", { variant: "error" });
      return;
    }

    try {
      await priceListService.updateListItem(editingItem.id, {
        price: parseFloat(editItemFormData.price),
      });
      enqueueSnackbar("Item price updated", { variant: "success" });
      setOpenEditItemDialog(false);
      setEditingItem(null);
      setEditItemFormData({ price: "" });
      loadData();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.detail || "Failed to update item",
        { variant: "error" }
      );
    }
  };

  /**
   * Handle delete price list
   */
  const handleDeletePriceList = async (id) => {
    if (!window.confirm("Are you sure you want to delete this price list?")) {
      return;
    }

    try {
      await priceListService.deletePriceList(id);
      enqueueSnackbar("Price list deleted", { variant: "success" });
      loadData();
    } catch (err) {
      enqueueSnackbar("Failed to delete price list", { variant: "error" });
    }
  };

  /**
   * Handle delete item
   */
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to remove this product?")) {
      return;
    }

    try {
      await priceListService.removeItemFromList(itemId);
      enqueueSnackbar("Product removed", { variant: "success" });
      loadData();
    } catch (err) {
      enqueueSnackbar("Failed to remove product", { variant: "error" });
    }
  };

  /**
   * Handle edit price list
   */
  const handleEditPriceList = (priceList) => {
    setEditingPriceList(priceList);
    setFormData({
      name: priceList.name,
      description: priceList.description,
      is_active: priceList.is_active,
      role_filter: priceList.role_filter || "",
    });
    setOpenDialog(true);
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setEditingPriceList(null);
    setFormData({
      name: "",
      description: "",
      is_active: true,
      role_filter: "",
    });
  };

  const handleClearFilters = () => {
    setSearchName("");
    setFilterActive("");
    setPage(1);
  };

  const columns = [
    {
      field: "name",
      header: "Name",
      render: (row) => row.name,
    },
    {
      field: "role_filter",
      header: "Role Filter",
      render: (row) => row.role_filter || "—",
    },
    {
      field: "description",
      header: "Description",
      render: (row) => row.description || "—",
    },
    {
      field: "is_active",
      header: "Status",
      render: (row) => (
        <StatusChip status={row.is_active ? "active" : "inactive"} />
      ),
    },
    {
      field: "actions",
      header: "Actions",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleEditPriceList(row);
            }}
            size="small"
            title="Edit price list"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePriceList(row.id);
            }}
            size="small"
            title="Delete price list"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Price Lists"
        description="Manage pricing for different customer segments"
      />

      {/* Filters */}
      <FilterPanel
        hasActiveFilters={!!hasActiveFilters}
        onClearFilters={handleClearFilters}
        resultsInfo={
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedPriceLists.length} of {filteredPriceLists.length}{" "}
            price lists
          </Typography>
        }
      >
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="Search by Name"
            placeholder="Search price lists..."
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              setPage(1);
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                setPage(1);
              }}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </FilterPanel>

      {/* Action Button */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          New Price List
        </Button>
      </Box>

      {/* Price Lists Table */}
      <DataTable
        columns={columns}
        data={paginatedPriceLists}
        loading={loading}
        emptyState={{
          title: hasActiveFilters ? "No Price Lists Match" : "No Price Lists",
          description: hasActiveFilters
            ? "Try adjusting your filters"
            : "Create your first price list",
        }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Price List Items Section */}
      {paginatedPriceLists.map((priceList) => (
        <Accordion key={priceList.id} sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {priceList.name} - Items
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PriceListItemsTable
              items={priceList.price_list_items || []}
              products={products}
              onAddItem={() => {
                setSelectedPriceList(priceList);
                setOpenItemDialog(true);
              }}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Dialogs */}
      <PriceListDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSavePriceList}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingPriceList}
      />

      <AddItemDialog
        open={openItemDialog}
        onClose={() => setOpenItemDialog(false)}
        onSave={handleSaveItem}
        formData={itemFormData}
        setFormData={setItemFormData}
        products={products}
      />

      <EditItemDialog
        open={openEditItemDialog}
        onClose={() => setOpenEditItemDialog(false)}
        onSave={handleSaveEditItem}
        price={editItemFormData.price}
        setPrice={(price) => setEditItemFormData({ price })}
      />
    </Container>
  );
};

export default AdminPriceListsPage;
