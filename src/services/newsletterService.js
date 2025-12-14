import apiClient from './api';

/**
 * Newsletter service
 */
const newsletterService = {
  /**
   * Subscribe to newsletter
   * @param {string} email - Email address
   * @returns {Promise<Object>} Subscription response
   */
  async subscribe(email) {
    const response = await apiClient.post('/newsletter/subscribe', { email });
    return response.data;
  },

  /**
   * Unsubscribe from newsletter
   * @param {string} email - Email address
   * @returns {Promise<Object>} Unsubscribe response
   */
  async unsubscribe(email) {
    const response = await apiClient.post('/newsletter/unsubscribe', { email });
    return response.data;
  },

  /**
   * Check subscription status
   * @returns {Promise<Object>} Subscription status
   */
  async getStatus() {
    const response = await apiClient.get('/newsletter/status');
    return response.data;
  },
};

export default newsletterService;
