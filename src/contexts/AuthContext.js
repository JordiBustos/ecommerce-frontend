import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService';
import userService from '../services/userService';
import { storeTokens, clearTokens, hasTokens, storeUserData, clearUserData } from '../utils/secureStorage';

/**
 * @typedef {Object} AuthContextType
 * @property {Object|null} user - Current user data
 * @property {boolean} isAuthenticated - Authentication status
 * @property {boolean} loading - Loading state
 * @property {Function} login - Login function
 * @property {Function} register - Register function
 * @property {Function} logout - Logout function
 * @property {Function} updateUser - Update user function
 */

const AuthContext = createContext(/** @type {AuthContextType|undefined} */ (undefined));

/**
 * Custom hook to use auth context
 * @returns {AuthContextType} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Auth provider component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount if authenticated
  useEffect(() => {
    const loadUser = async () => {
      if (hasTokens()) {
        try {
          const userData = await userService.getCurrentUser();
          setUser(userData);
          storeUserData(userData);
        } catch (error) {
          console.error('Failed to load user:', error);
          authService.logout();
          clearTokens();
          clearUserData();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Login user with credentials
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username - Username or email
   * @param {string} credentials.password - Password
   * @returns {Promise<void>}
   */
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    
    storeTokens(data.access_token, data.refresh_token);
    
    const userData = await userService.getCurrentUser();
    setUser(userData);
    storeUserData(userData);
  };

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} [userData.full_name] - User full name
   * @returns {Promise<void>}
   */
  const register = async (userData) => {
    await authService.register(userData);
  };

  /**
   * Logout current user
   */
  const logout = () => {
    authService.logout();
    clearTokens();
    clearUserData();
    setUser(null);
  };

  /**
   * Update current user data
   * @param {Object} userData - User data to update
   * @returns {Promise<void>}
   */
  const updateUser = async (userData) => {
    const updatedUser = await userService.updateProfile(userData);
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
