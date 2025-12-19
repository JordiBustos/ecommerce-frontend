import apiClient from './api';

/**
 * @typedef {Object} Coupon
 * @property {number} id - Coupon ID
 * @property {string} code - Coupon code
 * @property {string} description - Coupon description
 * @property {string} discount_type - Discount type (percentage or fixed)
 * @property {number} discount_value - Discount value
 * @property {number} min_order_amount - Minimum order amount
 * @property {number} max_uses - Maximum number of uses
 * @property {number} max_uses_per_user - Maximum uses per user
 * @property {boolean} is_active - Whether coupon is active
 * @property {string} valid_from - Valid from date
 * @property {string} valid_to - Valid to date
 * @property {number} current_uses - Current number of uses
 * @property {string} created_at - Creation date
 * @property {string} updated_at - Last update date
 * @property {Array} assigned_users - List of assigned users
 */

const couponService = {
  /**
   * Get all coupons (admin)
   * @param {Object} params - Query parameters
   * @returns {Promise<{coupons: Coupon[], total: number}>}
   */
  async getCoupons(params = {}) {
    const response = await apiClient.get('/coupons/', { params });
    return response.data;
  },

  /**
   * Get user's available coupons
   * @returns {Promise<Coupon[]>}
   */
  async getMyCoupons() {
    const response = await apiClient.get('/coupons/my-coupons');
    return response.data;
  },

  /**
   * Get coupon by ID
   * @param {number} couponId - Coupon ID
   * @returns {Promise<Coupon>}
   */
  async getCouponById(couponId) {
    const response = await apiClient.get(`/coupons/${couponId}`);
    return response.data;
  },

  /**
   * Create new coupon
   * @param {Object} couponData - Coupon data
   * @returns {Promise<Coupon>}
   */
  async createCoupon(couponData) {
    const response = await apiClient.post('/coupons/', couponData);
    return response.data;
  },

  /**
   * Update coupon
   * @param {number} couponId - Coupon ID
   * @param {Object} couponData - Coupon data
   * @returns {Promise<Coupon>}
   */
  async updateCoupon(couponId, couponData) {
    const response = await apiClient.put(`/coupons/${couponId}`, couponData);
    return response.data;
  },

  /**
   * Delete coupon
   * @param {number} couponId - Coupon ID
   * @returns {Promise<void>}
   */
  async deleteCoupon(couponId) {
    const response = await apiClient.delete(`/coupons/${couponId}`);
    return response.data;
  },

  /**
   * Validate coupon code
   * @param {string} code - Coupon code
   * @param {number} total - Current cart total
   * @returns {Promise<{valid: boolean, coupon?: Coupon, message?: string}>}
   */
  async validateCoupon(code, total) {
    const response = await apiClient.post(`/coupons/validate?order_total=${total}`, { code });
    return response.data;
  },
};

export default couponService;
