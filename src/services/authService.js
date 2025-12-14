import apiClient from './api';
import { validateEmail, validatePassword } from '../utils/security';
import { getAccessToken, clearTokens, hasTokens } from '../utils/secureStorage';

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
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }
    
    const formData = new FormData();
    formData.append('username', credentials.username.trim());
    formData.append('password', credentials.password);

    try {
      const response = await apiClient.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {RegisterData} userData - User registration data
   * @returns {Promise<AuthResponse>} Auth response with tokens
   */
  async register(userData) {
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email address');
    }
    
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    const response = await apiClient.post('/auth/register', {
      ...userData,
      email: userData.email.trim().toLowerCase(),
    });
    
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
    clearTokens();
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has access token
   */
  isAuthenticated() {
    return hasTokens();
  },

  /**
   * Get current access token
   * @returns {string|null} Access token or null
   */
  getToken() {
    return getAccessToken();
  },
};

export default authService;
