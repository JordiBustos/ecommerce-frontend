import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Container,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Favorite as FavoriteIcon,
  Receipt as ReceiptIcon,
  AdminPanelSettings as AdminIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useStore } from "../contexts/StoreContext";
import config from "../config";

/**
 * Navigation bar component
 */
const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { storeSettings } = useStore();
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAdminMenuOpen = (event) => {
    setAdminMenuAnchor(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAdminMenuAnchor(null);
  };

  const handleAdminNavigation = (path) => {
    navigate(path);
    handleAdminMenuClose();
  };

  const isAdmin = user?.is_superuser;

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            {storeSettings?.store_name || config.app.name}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <>
                    <Button
                      color="inherit"
                      startIcon={<AdminIcon />}
                      onClick={handleAdminMenuOpen}
                    >
                      Admin
                    </Button>
                    <Menu
                      anchorEl={adminMenuAnchor}
                      open={Boolean(adminMenuAnchor)}
                      onClose={handleAdminMenuClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                    >
                      <MenuItem
                        onClick={() => handleAdminNavigation("/admin/products")}
                      >
                        <ListItemIcon>
                          <InventoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>All Products</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleAdminNavigation("/admin/orders")}
                      >
                        <ListItemIcon>
                          <ReceiptIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>All Orders</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleAdminNavigation("/admin/carts")}
                      >
                        <ListItemIcon>
                          <ShoppingCartOutlined fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>All Carts</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() =>
                          handleAdminNavigation("/admin/categories")
                        }
                      >
                        <ListItemIcon>
                          <InventoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Categories</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleAdminNavigation("/admin/brands")}
                      >
                        <ListItemIcon>
                          <InventoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Brands</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleAdminNavigation("/admin/roles")}
                      >
                        <ListItemIcon>
                          <PeopleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Roles</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleAdminNavigation("/admin/users")}
                      >
                        <ListItemIcon>
                          <PeopleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Users</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() =>
                          handleAdminNavigation("/admin/price-lists")
                        }
                      >
                        <ListItemIcon>
                          <InventoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Price Lists</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                )}

                <Button color="inherit" onClick={() => navigate("/products")}>
                  Products
                </Button>

                <Button
                  color="inherit"
                  onClick={() => navigate("/orders")}
                  startIcon={<ReceiptIcon />}
                >
                  Orders
                </Button>

                <IconButton
                  color="inherit"
                  onClick={() => navigate("/favorites")}
                >
                  <FavoriteIcon />
                </IconButton>

                <IconButton color="inherit" onClick={() => navigate("/cart")}>
                  <Badge badgeContent={itemCount} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>

                <IconButton
                  color="inherit"
                  onClick={() => navigate("/profile")}
                >
                  <AccountCircleIcon />
                </IconButton>

                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate("/register")}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
