/**
 * Security utilities for input sanitization, XSS protection, and validation
 */

/**
 * Parse API error response into user-friendly message
 * @param {Error} error - Error object from API
 * @param {string} fallbackMessage - Default message if parsing fails
 * @returns {string} - User-friendly error message
 */
export const parseAPIError = (error, fallbackMessage = 'An error occurred') => {
  if (!error) return fallbackMessage;
  
  // Check for response data
  if (error.response?.data) {
    const errorData = error.response.data;
    
    // Handle FastAPI validation errors (array of error objects)
    if (errorData.detail && Array.isArray(errorData.detail)) {
      return errorData.detail
        .map(e => e.msg || e.message || JSON.stringify(e))
        .join('. ');
    }
    
    // Handle simple string detail
    if (typeof errorData.detail === 'string') {
      return errorData.detail;
    }
    
    // Handle message field
    if (errorData.message) {
      return errorData.message;
    }
    
    // Handle error field
    if (errorData.error) {
      return errorData.error;
    }
  }
  
  // Check for error message directly
  if (error.message) {
    return error.message;
  }
  
  return fallbackMessage;
};

/**
 * Sanitize HTML to prevent XSS attacks
 * Escapes HTML special characters
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input;
  
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char]);
};

/**
 * Sanitize user input by removing dangerous characters
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  let sanitized = input.replace(/\0/g, '');
  
  sanitized = sanitized.trim();
  
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  // RFC 5322 Official Standard
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate phone number (international format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

/**
 * Validate URL to prevent open redirect attacks
 * @param {string} url - URL to validate
 * @returns {boolean} - True if safe
 */
export const validateURL = (url) => {
  if (!url) return false;
  
  try {
    const parsedURL = new URL(url);
    
    if (!['http:', 'https:'].includes(parsedURL.protocol)) {
      return false;
    }
    
    // eslint-disable-next-line no-script-url
    if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
      return false;
    }
    
    return true;
  } catch {
    // Relative URLs are okay
    return url.startsWith('/') && !url.startsWith('//');
  }
};

/**
 * Sanitize URL for safe redirect
 * @param {string} url - URL to sanitize
 * @param {string} fallback - Fallback URL if invalid
 * @returns {string} - Safe URL
 */
export const sanitizeURL = (url, fallback = '/') => {
  if (!validateURL(url)) {
    return fallback;
  }
  return url;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { valid, errors }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate DNI/National ID format
 * @param {string} dni - DNI to validate
 * @returns {boolean} - True if valid format
 */
export const validateDNI = (dni) => {
  if (!dni) return false;
  
  // Allow alphanumeric with optional dashes
  const dniRegex = /^[A-Z0-9]{6,20}$/i;
  
  return dniRegex.test(dni.replace(/-/g, ''));
};

/**
 * Validate postal code
 * @param {string} postalCode - Postal code to validate
 * @returns {boolean} - True if valid
 */
export const validatePostalCode = (postalCode) => {
  if (!postalCode) return false;
  
  const postalRegex = /^[A-Z0-9\s-]{3,10}$/i;
  
  return postalRegex.test(postalCode);
};

/**
 * Sanitize object by sanitizing all string values
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    if (!payload.exp) return false;
    
    // Check if expired (with 60 second buffer)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < (currentTime + 60);
  } catch {
    return true;
  }
};



const securityUtils = {
  sanitizeHTML,
  sanitizeInput,
  sanitizeObject,
  sanitizeURL,
  validateEmail,
  validatePhone,
  validateURL,
  validatePassword,
  validateDNI,
  validatePostalCode,
  isTokenExpired,
};

export default securityUtils;
