import apiClient from "./api";

/**
 * @typedef {Object} CartItem
 * @property {number} id - Cart item ID
 * @property {number} product_id - Product ID
 * @property {number} quantity - Item quantity
 * @property {Object} product - Product details
 */

/**
 * @typedef {Object} Cart
 * @property {number} id - Cart ID
 * @property {CartItem[]} items - Cart items
 * @property {number} total - Total price
 */

const cartService = {
  /**
   * Get current user's cart
   * @returns {Promise<Cart>} Cart data
   */
  async getCart() {
    const response = await apiClient.get("/cart/");
    return response.data;
  },

  /**
   * Add item to cart
   * @param {Object} item - Item to add
   * @param {number} item.product_id - Product ID
   * @param {number} item.quantity - Quantity
   * @returns {Promise<CartItem>} Added cart item
   */
  async addToCart(item) {
    const response = await apiClient.post("/cart/items", item);
    return response.data;
  },

  /**
   * Update cart item quantity
   * @param {number} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<CartItem>} Updated cart item
   */
  async updateCartItem(itemId, quantity) {
    const response = await apiClient.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  /**
   * Remove item from cart
   * @param {number} itemId - Cart item ID
   * @returns {Promise<void>}
   */
  async removeFromCart(itemId) {
    await apiClient.delete(`/cart/items/${itemId}`);
  },

  /**
   * Clear entire cart
   * @returns {Promise<void>}
   */
  async clearCart() {
    await apiClient.delete("/cart/");
  },
};

export default cartService;
