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
  AccountCircle as AccountCircleIcon,
  Favorite as FavoriteIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  ShoppingCartOutlined,
  LocalOffer as CouponIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useStore } from "../contexts/StoreContext";
import config from "../config";
import CategoriesMenu from "./CategoriesMenu";

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
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: "1px solid #e5e5e5", bgcolor: "white" }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 80 }}>
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 900,
              letterSpacing: "1px",
              cursor: "pointer",
              textTransform: "uppercase",
              mr: 4,
            }}
            onClick={() => navigate("/")}
          >
            {storeSettings?.store_name || config.app.name}
          </Typography>

          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <CategoriesMenu />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <>
                    <Button
                      color="inherit"
                      onClick={handleAdminMenuOpen}
                      sx={{ fontWeight: 700 }}
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
                      PaperProps={{
                        elevation: 0,
                        sx: {
                          overflow: "visible",
                          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                          mt: 1.5,
                          border: "1px solid #e0e0e0",
                        },
                      }}
                    >
                      <MenuItem
                        onClick={() => handleAdminNavigation("/admin/products")}
                      >
                        <ListItemIcon>
                          <InventoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Products</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleAdminNavigation("/admin/orders")}
                      >
                        <ListItemIcon>
                          <ReceiptIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Orders</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleAdminNavigation("/admin/carts")}
                      >
                        <ListItemIcon>
                          <ShoppingCartOutlined fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Carts</ListItemText>
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
                      <MenuItem
                        onClick={() => handleAdminNavigation("/admin/coupons")}
                      >
                        <ListItemIcon>
                          <CouponIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Coupons</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                )}

                <IconButton
                  color="inherit"
                  onClick={() => navigate("/favorites")}
                >
                  <FavoriteIcon />
                </IconButton>

                <IconButton color="inherit" onClick={() => navigate("/orders")}>
                  <ReceiptIcon />
                </IconButton>

                <IconButton
                  color="inherit"
                  onClick={() => navigate("/profile")}
                >
                  <AccountCircleIcon />
                </IconButton>

                <IconButton color="inherit" onClick={() => navigate("/cart")}>
                  <Badge badgeContent={itemCount} color="primary">
                    <ShoppingCartOutlined />
                  </Badge>
                </IconButton>

                <Button color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/register")}
                  sx={{ color: "white" }}
                >
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
