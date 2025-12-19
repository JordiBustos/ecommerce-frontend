import apiClient from "./api";

/**
 * Service for role management operations
 */
const roleService = {
  /**
   * Get all roles
   * @returns {Promise<Array>} List of roles
   */
  async getRoles() {
    const response = await apiClient.get("/roles/");
    return response.data;
  },

  /**
   * Get role by ID
   * @param {number} roleId - Role ID
   * @returns {Promise<Object>} Role data
   */
  async getRoleById(roleId) {
    const response = await apiClient.get(`/roles/${roleId}`);
    return response.data;
  },

  /**
   * Get role by slug
   * @param {string} slug - Role slug
   * @returns {Promise<Object>} Role data
   */
  async getRoleBySlug(slug) {
    const response = await apiClient.get(`/roles/slug/${slug}`);
    return response.data;
  },

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} Created role
   */
  async createRole(roleData) {
    const response = await apiClient.post("/roles/", roleData);
    return response.data;
  },

  /**
   * Update role by ID
   * @param {number} roleId - Role ID
   * @param {Object} roleData - Role data to update
   * @returns {Promise<Object>} Updated role
   */
  async updateRole(roleId, roleData) {
    const response = await apiClient.put(`/roles/${roleId}`, roleData);
    return response.data;
  },

  /**
   * Delete role by ID
   * @param {number} roleId - Role ID
   * @returns {Promise<void>}
   */
  async deleteRole(roleId) {
    const response = await apiClient.delete(`/roles/${roleId}`);
    return response.data;
  },

  /**
   * Assign role to user
   * @param {number} roleId - Role ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Result
   */
  async assignRoleToUser(roleId, userId) {
    const response = await apiClient.post(`/roles/${roleId}/users/${userId}`);
    return response.data;
  },

  /**
   * Remove role from user
   * @param {number} roleId - Role ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Result
   */
  async removeRoleFromUser(roleId, userId) {
    const response = await apiClient.delete(`/roles/${roleId}/users/${userId}`);
    return response.data;
  },

  /**
   * Get users with specific role
   * @param {number} roleId - Role ID
   * @returns {Promise<Array>} List of users with the role
   */
  async getUsersWithRole(roleId) {
    const response = await apiClient.get(`/roles/${roleId}/users`);
    return response.data;
  },
};

export default roleService;
