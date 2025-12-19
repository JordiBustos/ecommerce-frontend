import apiClient from './api';

/**
 * @typedef {Object} PriceList
 * @property {number} id - Price List ID
 * @property {string} name - Price List name
 * @property {string} description - Price List description
 * @property {string} slug - Price List slug
 * @property {boolean} is_active - Whether price list is active
 * @property {string} role_filter - Role filter for the price list
 * @property {string} created_at - Creation timestamp
 */

const priceListService = {
  /**
   * Get all price lists
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of price lists
   */
  async getPriceLists(params = {}) {
    const response = await apiClient.get('/price-lists/', { params });
    return response.data;
  },

  /**
   * Get price list by ID
   * @param {number} priceListId - Price List ID
   * @returns {Promise<PriceList>} Price List details
   */
  async getPriceListById(priceListId) {
    const response = await apiClient.get(`/price-lists/${priceListId}`);
    return response.data;
  },

  /**
   * Get price list by slug
   * @param {string} slug - Price List slug
   * @returns {Promise<PriceList>} Price List details
   */
  async getPriceListBySlug(slug) {
    const response = await apiClient.get(`/price-lists/slug/${slug}`);
    return response.data;
  },

  /**
   * Create a new price list
   * @param {Object} priceListData - Price List data
   * @returns {Promise<PriceList>} Created price list
   */
  async createPriceList(priceListData) {
    const response = await apiClient.post('/price-lists/', priceListData);
    return response.data;
  },

  /**
   * Update price list
   * @param {number} priceListId - Price List ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<PriceList>} Updated price list
   */
  async updatePriceList(priceListId, updateData) {
    const response = await apiClient.put(`/price-lists/${priceListId}`, updateData);
    return response.data;
  },

  /**
   * Delete price list
   * @param {number} priceListId - Price List ID
   * @returns {Promise<void>}
   */
  async deletePriceList(priceListId) {
    await apiClient.delete(`/price-lists/${priceListId}`);
  },

  /**
   * Assign users to price list
   * @param {number} priceListId - Price List ID
   * @param {Object} data - { user_ids: [1, 2, 3] }
   * @returns {Promise<Object>} Response
   */
  async assignUsersToList(priceListId, data) {
    const response = await apiClient.post(
      `/price-lists/${priceListId}/users`,
      data
    );
    return response.data;
  },

  /**
   * Remove users from price list
   * @param {number} priceListId - Price List ID
   * @param {Object} data - { user_ids: [1, 2, 3] }
   * @returns {Promise<Object>} Response
   */
  async removeUsersFromList(priceListId, data) {
    const response = await apiClient.delete(`/price-lists/${priceListId}/users`, {
      data,
    });
    return response.data;
  },

  /**
   * Add product to price list
   * @param {number} priceListId - Price List ID
   * @param {Object} itemData - { product_id: 1, price: 99.99 }
   * @returns {Promise<Object>} Created item
   */
  async addItemToList(priceListId, itemData) {
    const response = await apiClient.post(
      `/price-lists/${priceListId}/items`,
      itemData
    );
    return response.data;
  },

  /**
   * Update price list item
   * @param {number} itemId - Item ID
   * @param {Object} updateData - { price: 99.99 }
   * @returns {Promise<Object>} Updated item
   */
  async updateListItem(itemId, updateData) {
    const response = await apiClient.put(`/price-lists/items/${itemId}`, updateData);
    return response.data;
  },

  /**
   * Remove product from price list
   * @param {number} itemId - Item ID
   * @returns {Promise<void>}
   */
  async removeItemFromList(itemId) {
    await apiClient.delete(`/price-lists/items/${itemId}`);
  },
};

export default priceListService;
