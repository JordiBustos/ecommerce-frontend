import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider, useSnackbar } from "notistack";
import { StoreProvider } from "./contexts/StoreContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { setNotificationHandler } from "./services/api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/user/LoginPage";
import RegisterPage from "./pages/user/RegisterPage";
import ProfilePage from "./pages/user/ProfilePage";
import ProductsPage from "./pages/product/ProductsPage";
import ProductDetailPage from "./pages/product/ProductDetailPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/cart/CheckoutPage";
import OrderConfirmationPage from "./pages/order/OrderConfirmationPage";
import FavoritesPage from "./pages/product/FavoritesPage";
import OrdersPage from "./pages/order/OrdersPage";
import OrderDetailPage from "./pages/order/OrderDetailPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";

// Admin Pages
import AdminCartsPage from "./pages/cart/admin/AdminCartsPage";
import AdminOrdersPage from "./pages/order/admin/AdminOrdersPage";
import AdminEditOrderPage from "./pages/order/admin/AdminEditOrderPage";
import AdminProductsPage from "./pages/product/admin/AdminProductsPage";
import AdminEditProductPage from "./pages/order/admin/AdminEditProductPage";
import AddProductPage from "./pages/product/admin/AddProductPage";
import AdminCategoriesPage from "./pages/product/admin/AdminCategoriesPage";
import AdminBrandsPage from "./pages/product/admin/AdminBrandsPage";
import AdminRolesPage from "./pages/user/admin/AdminRolesPage";
import AdminUsersPage from "./pages/user/admin/AdminUsersPage";
import AdminPriceListsPage from "./pages/price-list/admin/AdminPriceListsPage";

/**
 * Inner app component to access snackbar
 */
const AppContent = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Set global notification handler for API errors
    setNotificationHandler(enqueueSnackbar);
  }, [enqueueSnackbar]);

  return (
    <StoreProvider>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Navbar />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route
                  path="/shipping-policy"
                  element={<ShippingPolicyPage />}
                />
                <Route path="/products" element={<ProductsPage />} />
                <Route
                  path="/products/:productSlug"
                  element={<ProductDetailPage />}
                />

                {/* Protected routes */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmation"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin/carts"
                  element={
                    <AdminRoute>
                      <AdminCartsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrdersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders/:orderId/edit"
                  element={
                    <AdminRoute>
                      <AdminEditOrderPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminProductsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products/add"
                  element={
                    <AdminRoute>
                      <AddProductPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products/:productSlug/edit"
                  element={
                    <AdminRoute>
                      <AdminEditProductPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <AdminRoute>
                      <AdminCategoriesPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/brands"
                  element={
                    <AdminRoute>
                      <AdminBrandsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/roles"
                  element={
                    <AdminRoute>
                      <AdminRolesPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminUsersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/price-lists"
                  element={
                    <AdminRoute>
                      <AdminPriceListsPage />
                    </AdminRoute>
                  }
                />
              </Routes>
              <Footer />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </StoreProvider>
  );
};

/**
 * Main App component
 */
function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      autoHideDuration={3000}
    >
      <AppContent />
    </SnackbarProvider>
  );
}

export default App;
