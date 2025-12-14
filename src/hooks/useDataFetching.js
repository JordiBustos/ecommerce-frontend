import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for data fetching with loading and error states
 * Implements the Hook pattern for reusable stateful logic
 * 
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Array} dependencies - Dependencies array for refetching
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, refetch }
 */
const useDataFetching = (fetchFunction, dependencies = [], options = {}) => {
  const {
    initialData = null,
    onSuccess,
    onError,
    immediate = true,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch, setData };
};

export default useDataFetching;
