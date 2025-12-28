'use client';

import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useWebHandler() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

//   const baseUrl = 'http://localhost:3000/api/';

  const getHeaders = useCallback((isFormData: boolean = false): HeadersInit => {
    const headers: HeadersInit = {};
    
    // Only set Content-Type if it's not FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const token = Cookies.get('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const handleResponse = async <T,>(response: Response): Promise<T> => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

//   const getUrl = (endpoint: string): string => {
//     return `${baseUrl}${endpoint}`;
//   };

  const get = useCallback(async <T,>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch((endpoint), {
        method: 'GET',
        headers: { ...getHeaders(), ...headers },
      });
      const data = await handleResponse<T>(response);
      return { data, error: null, loading: false };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { data: null, error: errorMessage, loading: false };
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const post = useCallback(async <T,>(endpoint: string, data: FormData | Record<string, unknown>, headers?: HeadersInit): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = data instanceof FormData;
      const body = isFormData ? data : JSON.stringify(data);
      
      const response = await fetch((endpoint), {
        method: 'POST',
        headers: { ...getHeaders(isFormData), ...headers },
        body,
      });
      const responseData = await handleResponse<T>(response);
      return { data: responseData, error: null, loading: false };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { data: null, error: errorMessage, loading: false };
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const put = useCallback(async <T,>(endpoint: string, data: FormData | Record<string, unknown>, headers?: HeadersInit): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = data instanceof FormData;
      const body = isFormData ? data : JSON.stringify(data);
      
      const response = await fetch((endpoint), {
        method: 'PUT',
        headers: { ...getHeaders(isFormData), ...headers },
        body,
      });
      const responseData = await handleResponse<T>(response);
      return { data: responseData, error: null, loading: false };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { data: null, error: errorMessage, loading: false };
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const del = useCallback(async <T,>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch((endpoint), {
        method: 'DELETE',
        headers: { ...getHeaders(), ...headers },
      });
      const responseData = await handleResponse<T>(response);
      return { data: responseData, error: null, loading: false };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { data: null, error: errorMessage, loading: false };
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
  };
}

export default useWebHandler;
