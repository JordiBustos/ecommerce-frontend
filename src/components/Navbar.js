import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Container,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Favorite as FavoriteIcon,
  Receipt as ReceiptIcon,
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
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { storeSettings } = useStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
