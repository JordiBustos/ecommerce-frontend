import apiClient from './api';

/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} email - User email
 * @property {string} [full_name] - User full name
 * @property {boolean} is_active - User active status
 * @property {boolean} is_superuser - Admin status
 */

const userService = {
  /**
   * Get current user profile
   * @returns {Promise<User>} User data
   */
  async getCurrentUser() {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  /**
   * Update current user profile
   * @param {Partial<User>} userData - User data to update
   * @returns {Promise<User>} Updated user data
   */
  async updateProfile(userData) {
    const response = await apiClient.put('/users/me', userData);
    return response.data;
  },

  /**
   * Get all users (admin only)
   * @returns {Promise<User[]>} List of users
   */
  async getAllUsers() {
    const response = await apiClient.get('/users/');
    return response.data;
  },

  /**
   * Get user by ID (admin only)
   * @param {number} userId - User ID
   * @returns {Promise<User>} User data
   */
  async getUserById(userId) {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get user addresses
   * @returns {Promise<Array>} List of user addresses
   */
  async getAddresses() {
    const response = await apiClient.get('/addresses/');
    return response.data;
  },

  /**
   * Add new address
   * @param {Object} addressData - Address data
   * @returns {Promise<Object>} Created address
   */
  async addAddress(addressData) {
    const response = await apiClient.post('/addresses/', addressData);
    return response.data;
  },

  /**
   * Update address
   * @param {number} addressId - Address ID
   * @param {Object} addressData - Address data to update
   * @returns {Promise<Object>} Updated address
   */
  async updateAddress(addressId, addressData) {
    const response = await apiClient.put(`/addresses/${addressId}`, addressData);
    return response.data;
  },

  /**
   * Delete address
   * @param {number} addressId - Address ID
   * @returns {Promise<void>}
   */
  async deleteAddress(addressId) {
    await apiClient.delete(`/addresses/${addressId}`);
  },
};

export default userService;
