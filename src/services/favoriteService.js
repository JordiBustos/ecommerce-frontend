import apiClient from './api';

/**
 * Favorite service
 * Handles all favorite-related API calls
 */
const favoriteService = {
  /**
   * Get user favorites
   * @returns {Promise<Array>} List of favorite products
   */
  getFavorites: async () => {
    try {
      const response = await apiClient.get('/favorites/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add product to favorites
   * @param {number} productId - Product ID to add
   * @returns {Promise<Object>} Added favorite
   */
  addFavorite: async (productId) => {
    try {
      const response = await apiClient.post(`/favorites/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove product from favorites
   * @param {number} productId - Product ID to remove
   * @returns {Promise<void>}
   */
  removeFavorite: async (productId) => {
    try {
      const response = await apiClient.delete(`/favorites/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if product is in favorites
   * @param {number} productId - Product ID to check
   * @param {Array} favorites - List of favorites
   * @returns {boolean}
   */
  isFavorite: (productId, favorites) => {
    return favorites.some(fav => fav.product_id === productId || fav.id === productId);
  },
};

export default favoriteService;
