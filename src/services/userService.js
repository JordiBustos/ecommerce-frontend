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
};

export default userService;
