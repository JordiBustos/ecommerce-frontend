import apiClient from "./api";

/**
 * Address service
 * Handles all address-related API calls
 */
const addressService = {
  /**
   * Get all user addresses
   * @returns {Promise<Array>} List of addresses
   */
  getAddresses: async () => {
    try {
      const response = await apiClient.get("/addresses/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get address by ID
   * @param {number} addressId - Address ID
   * @returns {Promise<Object>} Address data
   */
  getAddress: async (addressId) => {
    try {
      const response = await apiClient.get(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new address
   * @param {Object} addressData - Address data
   * @returns {Promise<Object>} Created address
   */
  createAddress: async (addressData) => {
    try {
      const response = await apiClient.post("/addresses/", addressData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update address
   * @param {number} addressId - Address ID
   * @param {Object} addressData - Address data to update
   * @returns {Promise<Object>} Updated address
   */
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await apiClient.put(
        `/addresses/${addressId}`,
        addressData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete address
   * @param {number} addressId - Address ID
   * @returns {Promise<void>}
   */
  deleteAddress: async (addressId) => {
    try {
      await apiClient.delete(`/addresses/${addressId}`);
    } catch (error) {
      throw error;
    }
  },
};

export default addressService;
