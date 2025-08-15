import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await apiCall(...args);
        setState({ data: result, loading: false, error: null });
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const error = err as AxiosError<ApiError>;
        const apiError: ApiError = error.response?.data || {
          message: error.message || 'An unexpected error occurred',
          statusCode: error.response?.status || 500,
        };
        
        setState({ data: null, loading: false, error: apiError });
        
        if (options.onError) {
          options.onError(apiError);
        }
        
        throw apiError;
      }
    },
    [apiCall, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for paginated data
export function usePaginatedApi<T = any>(
  apiCall: (params: any) => Promise<any>,
  initialParams: any = {}
) {
  const [params, setParams] = useState(initialParams);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall({ ...params, page });
      setData(response.data);
      setTotal(response.total);
      setLoading(false);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const apiError: ApiError = error.response?.data || {
        message: error.message || 'An unexpected error occurred',
        statusCode: error.response?.status || 500,
      };
      setError(apiError);
      setLoading(false);
    }
  }, [apiCall, params, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = useCallback((newParams: any) => {
    setParams(newParams);
    setPage(1);
  }, []);

  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    total,
    page,
    loading,
    error,
    updateParams,
    changePage,
    refresh,
  };
}

export default useApi;
