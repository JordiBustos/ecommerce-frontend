/**
 * Secure storage utilities for handling sensitive data
 */

const ENCRYPTION_KEY = 'ecommerce_secure_key'; // In production, use environment variable

/**
 * Simple encryption using base64 (for basic obfuscation)
 * Note: For production, use a proper encryption library like crypto-js
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data
 */
const encrypt = (data) => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(data)));
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Simple decryption
 * @param {string} encryptedData - Encrypted data
 * @returns {any} - Decrypted data
 */
const decrypt = (encryptedData) => {
  try {
    return JSON.parse(decodeURIComponent(atob(encryptedData)));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Securely store auth tokens
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 */
export const storeTokens = (accessToken, refreshToken) => {
  try {
    sessionStorage.setItem('access_token', encrypt(accessToken));
    
    if (refreshToken) {
      localStorage.setItem('refresh_token', encrypt(refreshToken));
    }
    
    sessionStorage.setItem('token_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

/**
 * Get access token
 * @returns {string|null} - Access token
 */
export const getAccessToken = () => {
  try {
    const encrypted = sessionStorage.getItem('access_token');
    if (!encrypted) return null;
    
    return decrypt(encrypted);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get refresh token
 * @returns {string|null} - Refresh token
 */
export const getRefreshToken = () => {
  try {
    const encrypted = localStorage.getItem('refresh_token');
    if (!encrypted) return null;
    
    return decrypt(encrypted);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Clear all tokens
 */
export const clearTokens = () => {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('token_timestamp');
  localStorage.removeItem('refresh_token');
};

/**
 * Check if tokens exist
 * @returns {boolean} - True if tokens exist
 */
export const hasTokens = () => {
  return !!getAccessToken();
};

/**
 * Securely store user data
 * @param {Object} userData - User data to store
 */
export const storeUserData = (userData) => {
  try {
    const safeData = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
    };
    
    sessionStorage.setItem('user_data', encrypt(safeData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

/**
 * Get stored user data
 * @returns {Object|null} - User data
 */
export const getUserData = () => {
  try {
    const encrypted = sessionStorage.getItem('user_data');
    if (!encrypted) return null;
    
    return decrypt(encrypted);
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Clear user data
 */
export const clearUserData = () => {
  sessionStorage.removeItem('user_data');
};

/**
 * Clear all secure storage
 */
export const clearAllSecureStorage = () => {
  clearTokens();
  clearUserData();
  
  sessionStorage.clear();
};

/**
 * Check if storage is available
 * @param {string} type - 'localStorage' or 'sessionStorage'
 * @returns {boolean} - True if available
 */
export const isStorageAvailable = (type) => {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export default {
  storeTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  hasTokens,
  storeUserData,
  getUserData,
  clearUserData,
  clearAllSecureStorage,
  isStorageAvailable,
};
