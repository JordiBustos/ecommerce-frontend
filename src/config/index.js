/**
 * Application configuration
 * All environment variables are accessed through this config object
 */

const config = {
  api: {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001',
    version: process.env.REACT_APP_API_VERSION || 'v1',
    timeout: 30000, // 30 seconds
  },
  app: {
    name: process.env.REACT_APP_NAME || 'E-Commerce Store',
  },
  auth: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
  },
};

/**
 * Get the full API URL with version
 * @returns {string} Full API base URL
 */
export const getApiUrl = () => {
  return `${config.api.baseURL}/api/${config.api.version}`;
};

export default config;
