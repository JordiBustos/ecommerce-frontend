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
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Product>} Created product
   */
  async createProduct(productData) {
    const response = await apiClient.post("/products/", productData);
    return response.data;
  },

  /**
   * Import products from CSV file
   * @param {File} file - CSV file
   * @param {number} [batchSize=50] - Number of products to process per batch
   * @returns {Promise<Object>} Import results with total_rows, successful, failed, errors, message
   */
  async importProductsFromCSV(file, batchSize = 50) {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await apiClient.post(
      `/products/import/csv?batch_size=${batchSize}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
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

  /**
   * Delete all products (DANGEROUS)
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAllProducts() {
    const response = await apiClient.delete("/products/all");
    return response.data;
  },

  // Category CRUD operations
  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData) {
    const response = await apiClient.post("/products/categories", categoryData);
    return response.data;
  },

  /**
   * Get category by ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Category data
   */
  async getCategoryById(categoryId) {
    const response = await apiClient.get(`/products/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Update category by ID
   * @param {number} categoryId - Category ID
   * @param {Object} categoryData - Category data to update
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(categoryId, categoryData) {
    const response = await apiClient.put(`/products/categories/${categoryId}`, categoryData);
    return response.data;
  },

  /**
   * Delete category by ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<void>}
   */
  async deleteCategory(categoryId) {
    const response = await apiClient.delete(`/products/categories/${categoryId}`);
    return response.data;
  },

  // Brand CRUD operations
  /**
   * Create a new brand
   * @param {Object} brandData - Brand data
   * @returns {Promise<Object>} Created brand
   */
  async createBrand(brandData) {
    const response = await apiClient.post("/products/brands", brandData);
    return response.data;
  },

  /**
   * Get brand by ID
   * @param {number} brandId - Brand ID
   * @returns {Promise<Object>} Brand data
   */
  async getBrandById(brandId) {
    const response = await apiClient.get(`/products/brands/${brandId}`);
    return response.data;
  },

  /**
   * Update brand by ID
   * @param {number} brandId - Brand ID
   * @param {Object} brandData - Brand data to update
   * @returns {Promise<Object>} Updated brand
   */
  async updateBrand(brandId, brandData) {
    const response = await apiClient.put(`/products/brands/${brandId}`, brandData);
    return response.data;
  },

  /**
   * Delete brand by ID
   * @param {number} brandId - Brand ID
   * @returns {Promise<void>}
   */
  async deleteBrand(brandId) {
    const response = await apiClient.delete(`/products/brands/${brandId}`);
    return response.data;
  },
};

export default productService;
