import apiClient from './api';

/**
 * @typedef {Object} LoginCredentials
 * @property {string} username - User email or username
 * @property {string} password - User password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} [full_name] - User full name
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} access_token - JWT access token
 * @property {string} refresh_token - JWT refresh token
 * @property {string} token_type - Token type (Bearer)
 */

const authService = {
  /**
   * Login user with credentials
   * @param {LoginCredentials} credentials - Login credentials
   * @returns {Promise<AuthResponse>} Auth response with tokens
   */
  async login(credentials) {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  },

  /**
   * Register a new user
   * @param {RegisterData} userData - User registration data
   * @returns {Promise<AuthResponse>} Auth response with tokens
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<AuthResponse>} New tokens
   */
  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Logout user (client-side only)
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has access token
   */
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get current access token
   * @returns {string|null} Access token or null
   */
  getToken() {
    return localStorage.getItem('access_token');
  },
};

export default authService;
