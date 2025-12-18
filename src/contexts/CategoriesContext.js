import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import productService from '../services/productService';

/**
 * @typedef {Object} Category
 * @property {number} id - Category ID
 * @property {string} name - Category name
 * @property {string} [description] - Category description
 * @property {number|null} parent_id - Parent category ID
 * @property {Category[]} [children] - Child categories (for hierarchy)
 */

/**
 * @typedef {Object} CategoriesContextType
 * @property {Category[]} categories - All categories (flat list)
 * @property {Category[]} categoriesTree - Categories organized in hierarchy
 * @property {Category[]} categoriesFlat - Categories in hierarchical order with depth info
 * @property {boolean} loading - Loading state
 * @property {Error|null} error - Error state
 * @property {Function} refreshCategories - Refresh categories from API
 * @property {Function} getCategoryById - Get category by ID
 * @property {Function} getCategoryPath - Get breadcrumb path for a category
 */

const CategoriesContext = createContext(/** @type {CategoriesContextType|undefined} */ (undefined));

/**
 * Custom hook to use categories context
 * @returns {CategoriesContextType} Categories context value
 * @throws {Error} If used outside CategoriesProvider
 */
export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

/**
 * Build hierarchical category tree from flat list
 * @param {Category[]} categories - Flat list of categories
 * @returns {Category[]} Hierarchical category tree
 */
const buildCategoryTree = (categories) => {
  const categoryMap = new Map();
  const tree = [];

  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  categories.forEach((category) => {
    const node = categoryMap.get(category.id);
    if (category.parent_id === null || category.parent_id === undefined) {
      tree.push(node);
    } else {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    }
  });

  return tree;
};

/**
 * Flatten hierarchical category tree into a list with depth information
 * @param {Category[]} tree - Hierarchical category tree
 * @param {number} depth - Current depth level
 * @returns {Array<{category: Category, depth: number}>} Flat list with depth
 */
const flattenCategoryTree = (tree, depth = 0) => {
  const result = [];
  
  tree.forEach((node) => {
    result.push({ ...node, depth });
    if (node.children && node.children.length > 0) {
      result.push(...flattenCategoryTree(node.children, depth + 1));
    }
  });
  
  return result;
};

/**
 * Categories provider component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [categoriesFlat, setCategoriesFlat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load categories from API
   */
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getCategories();
      const tree = buildCategoryTree(data);
      setCategories(data);
      setCategoriesTree(tree);
      setCategoriesFlat(flattenCategoryTree(tree));
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err);
      setCategories([]);
      setCategoriesTree([]);
      setCategoriesFlat([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get category by ID
   * @param {number} categoryId - Category ID
   * @returns {Category|undefined} Category object
   */
  const getCategoryById = useCallback(
    (categoryId) => {
      return categories.find((cat) => cat.id === categoryId);
    },
    [categories]
  );

  /**
   * Get breadcrumb path for a category (from root to category)
   * @param {number} categoryId - Category ID
   * @returns {Category[]} Array of categories from root to target
   */
  const getCategoryPath = useCallback(
    (categoryId) => {
      const path = [];
      let currentCategory = getCategoryById(categoryId);

      while (currentCategory) {
        path.unshift(currentCategory);
        if (currentCategory.parent_id) {
          currentCategory = getCategoryById(currentCategory.parent_id);
        } else {
          currentCategory = null;
        }
      }

      return path;
    },
    [getCategoryById]
  );

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const value = {
    categories,
    categoriesTree,
    categoriesFlat,
    loading,
    error,
    refreshCategories: loadCategories,
    getCategoryById,
    getCategoryPath,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

CategoriesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CategoriesContext;
