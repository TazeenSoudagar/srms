import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      // Only show toast if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        toast.error('Your session has expired. Please login again.');
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      toast.error('The requested resource was not found.');
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      if (errors) {
        // Display first validation error
        const firstError = Object.values(errors)[0];
        if (firstError && firstError.length > 0) {
          toast.error(firstError[0]);
        }
      } else if (error.response.data.message) {
        toast.error(error.response.data.message);
      }
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error('An unexpected error occurred. Please try again later.');
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// Helper type for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}
