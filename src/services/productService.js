import apiClient from "./api";

/**
 * @typedef {Object} Product
 * @property {number} id - Product ID
 * @property {string} name - Product name
 * @property {string} description - Product description
 * @property {number} price - Product price
 * @property {string} [image_url] - Product image URL
 * @property {number} stock - Available stock
 * @property {number} category_id - Category ID
 * @property {number} [brand_id] - Brand ID
 */

const productService = {
  /**
   * Get all products with pagination
   * @param {Object} params - Query parameters
   * @param {number} [params.skip] - Number of items to skip
   * @param {number} [params.limit] - Number of items to return
   * @returns {Promise<Product[]>} List of products
   */
  async getProducts(params = {}) {
    const response = await apiClient.get("/products/", { params });
    return response.data;
  },

  /**
   * Get product by ID
   * @param {number} productId - Product ID
   * @returns {Promise<Product>} Product data
   */
  async getProductById(productId) {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  },

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @param {number} [params.skip] - Number of items to skip
   * @param {number} [params.limit] - Number of items to return
   * @returns {Promise<{products: Product[], total: number}>} Matching products with total count
   */
  async searchProducts(query, params = {}) {
    const response = await apiClient.get("/products/search/", {
      params: { q: query, ...params },
    });
    return response.data;
  },

  /**
   * Get all categories
   * @returns {Promise<Array>} List of categories
   */
  async getCategories() {
    const response = await apiClient.get("/products/categories");
    return response.data;
  },

  /**
   * Get all brands
   * @returns {Promise<Array>} List of brands
   */
  async getBrands() {
    const response = await apiClient.get("/products/brands");
    return response.data;
  },

  /**
   * Get best selling products
   * @returns {Promise<Product[]>} Best selling products
   */
  async getBestSelling() {
    const response = await apiClient.get("/best-selling/");
    return response.data;
  },

  /**
   * Update product by ID
   * @param {number} productId - Product ID
   * @param {Object} productData - Product data to update
   * @returns {Promise<Product>} Updated product data
   */
  async updateProduct(productId, productData) {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data;
  },

  /**
   * Delete product by ID
   * @param {number} productId - Product ID
   * @returns {Promise<void>}
   */
  async deleteProduct(productId) {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  },
};

export default productService;
