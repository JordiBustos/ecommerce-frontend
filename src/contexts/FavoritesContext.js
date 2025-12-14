import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import favoriteService from '../services/favoriteService';
import { useAuth } from './AuthContext';

/**
 * @typedef {Object} FavoritesContextType
 * @property {Array} favorites - List of favorite products
 * @property {boolean} loading - Loading state
 * @property {Function} addFavorite - Add product to favorites
 * @property {Function} removeFavorite - Remove product from favorites
 * @property {Function} toggleFavorite - Toggle product favorite status
 * @property {Function} isFavorite - Check if product is in favorites
 * @property {Function} refreshFavorites - Reload favorites from API
 */

const FavoritesContext = createContext(/** @type {FavoritesContextType|undefined} */ (undefined));

/**
 * Custom hook to use favorites context
 * @returns {FavoritesContextType} Favorites context value
 */
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

/**
 * Favorites provider component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  /**
   * Load favorites from API
   */
  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      const data = await favoriteService.getFavorites();
      setFavorites(data);
    } catch (error) {
      setFavorites([]);
      // Error will be handled by component
    } finally {
      setLoading(false);
    }
  };

  // Load favorites when authentication status changes
  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated]);

  /**
   * Add product to favorites
   * @param {number} productId - Product ID
   * @returns {Promise<void>}
   */
  const addFavorite = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to add favorites');
    }

    try {
      const newFavorite = await favoriteService.addFavorite(productId);
      // Ensure the favorite has product_id field for consistent checking
      const formattedFavorite = {
        ...newFavorite,
        product_id: newFavorite.product_id || productId,
      };
      setFavorites((prev) => [...prev, formattedFavorite]);
    } catch (error) {
      throw error; // Propagate to component
    }
  };

  /**
   * Remove product from favorites
   * @param {number} productId - Product ID
   * @returns {Promise<void>}
   */
  const removeFavorite = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to remove favorites');
    }

    try {
      await favoriteService.removeFavorite(productId);
      setFavorites((prev) =>
        prev.filter((fav) => fav.product_id !== productId && fav.id !== productId)
      );
    } catch (error) {
      throw error; // Propagate to component
    }
  };

  /**
   * Toggle favorite status
   * @param {number} productId - Product ID
   * @returns {Promise<void>}
   */
  const toggleFavorite = async (productId) => {
    const isFav = isFavorite(productId);
    if (isFav) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  };

  /**
   * Check if product is in favorites
   * @param {number} productId - Product ID
   * @returns {boolean}
   */
  const isFavorite = (productId) => {
    return favoriteService.isFavorite(productId, favorites);
  };

  /**
   * Refresh favorites from API
   * @returns {Promise<void>}
   */
  const refreshFavorites = async () => {
    await loadFavorites();
  };

  const value = {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
