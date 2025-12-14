import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../theme';
import storeService from '../services/storeService';

/**
 * @typedef {Object} StoreContextType
 * @property {Object|null} storeSettings - Store settings
 * @property {boolean} loading - Loading state
 * @property {Function} refreshStoreSettings - Refresh store settings
 */

const StoreContext = createContext(/** @type {StoreContextType|undefined} */ (undefined));

/**
 * Custom hook to use store context
 * @returns {StoreContextType} Store context value
 */
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

/**
 * Store provider component that manages dynamic theme
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const StoreProvider = ({ children }) => {
  const [storeSettings, setStoreSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(createAppTheme());

  /**
   * Load store settings from API
   */
  const loadStoreSettings = async () => {
    try {
      const settings = await storeService.getStoreSettings();
      setStoreSettings(settings);
      
      // Create theme with store colors
      if (settings.primary_color || settings.secondary_color || settings.accent_color) {
        const newTheme = createAppTheme(
          settings.primary_color,
          settings.secondary_color,
          settings.accent_color
        );
        setTheme(newTheme);
      }
    } catch (error) {
      console.error('Failed to load store settings:', error);
      // Continue with default theme
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreSettings();
  }, []);

  const value = {
    storeSettings,
    loading,
    refreshStoreSettings: loadStoreSettings,
  };

  return (
    <StoreContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </StoreContext.Provider>
  );
};

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StoreContext;
