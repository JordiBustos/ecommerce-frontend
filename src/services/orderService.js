import apiClient from './api';

/**
 * @typedef {Object} Order
 * @property {number} id - Order ID
 * @property {string} status - Order status
 * @property {number} total - Order total
 * @property {string} created_at - Creation timestamp
 */

const orderService = {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Order>} Created order
   */
  async createOrder(orderData) {
    const response = await apiClient.post('/orders/', orderData);
    return response.data;
  },

  /**
   * Get user's orders
   * @param {Object} params - Query parameters
   * @returns {Promise<Order[]>} List of orders
   */
  async getOrders(params = {}) {
    const response = await apiClient.get('/orders/', { params });
    return response.data;
  },

  /**
   * Get order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Order>} Order details
   */
  async getOrder(orderId) {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  async getOrderById(orderId) {
    return this.getOrder(orderId);
  },

  /**
   * Update order status
   * @param {number} orderId - Order ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Order>} Updated order
   */
  async updateOrder(orderId, updateData) {
    const response = await apiClient.put(`/orders/${orderId}`, updateData);
    return response.data;
  },

  /**
   * Upload payment receipt
   * @param {number} orderId - Order ID
   * @param {File} file - Receipt file
   * @returns {Promise<Object>} Upload response
   */
  async uploadReceipt(orderId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(
      `/orders/${orderId}/upload-receipt`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default orderService;
