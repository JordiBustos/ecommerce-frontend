import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

/**
 * @typedef {Object} CartContextType
 * @property {Object|null} cart - Cart data
 * @property {number} itemCount - Total items in cart
 * @property {boolean} loading - Loading state
 * @property {Function} addToCart - Add item to cart
 * @property {Function} updateCartItem - Update cart item
 * @property {Function} removeFromCart - Remove item from cart
 * @property {Function} clearCart - Clear cart
 * @property {Function} refreshCart - Refresh cart data
 */

const CartContext = createContext(/** @type {CartContextType|undefined} */ (undefined));

/**
 * Custom hook to use cart context
 * @returns {CartContextType} Cart context value
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

/**
 * Cart provider component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  /**
   * Load cart data
   */
  const loadCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart when user authenticates
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  /**
   * Add item to cart
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity
   * @returns {Promise<void>}
   */
  const addToCart = async (productId, quantity = 1) => {
    await cartService.addToCart({ product_id: productId, quantity });
    await loadCart();
  };

  /**
   * Update cart item quantity
   * @param {number} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<void>}
   */
  const updateCartItem = async (itemId, quantity) => {
    await cartService.updateCartItem(itemId, quantity);
    await loadCart();
  };

  /**
   * Remove item from cart
   * @param {number} itemId - Cart item ID
   * @returns {Promise<void>}
   */
  const removeFromCart = async (itemId) => {
    await cartService.removeFromCart(itemId);
    await loadCart();
  };

  /**
   * Clear entire cart
   * @returns {Promise<void>}
   */
  const clearCart = async () => {
    await cartService.clearCart();
    await loadCart();
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = {
    cart,
    itemCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CartContext;
