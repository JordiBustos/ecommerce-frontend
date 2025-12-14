import apiClient from './api';

/**
 * @typedef {Object} StoreSettings
 * @property {string} primary_color - Primary brand color
 * @property {string} secondary_color - Secondary brand color
 * @property {string} accent_color - Accent color
 * @property {string} [store_name] - Store name
 * @property {string} [logo_url] - Logo URL
 * @property {string} [description] - Store description
 * @property {string} [contact_email] - Contact email
 * @property {string} [contact_phone] - Contact phone
 */

const storeService = {
  /**
   * Get store settings
   * @returns {Promise<StoreSettings>} Store settings
   */
  async getStoreSettings() {
    const response = await apiClient.get('/store/');
    return response.data;
  },

  /**
   * Update store settings (admin only)
   * @param {Partial<StoreSettings>} settings - Settings to update
   * @returns {Promise<StoreSettings>} Updated settings
   */
  async updateStoreSettings(settings) {
    const response = await apiClient.put('/store/', settings);
    return response.data;
  },
};

export default storeService;
