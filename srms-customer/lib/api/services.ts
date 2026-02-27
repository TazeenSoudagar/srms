import { apiClient, ApiResponse, PaginatedResponse } from './client';
import { Service, ServiceCategory, ServiceFilters } from '../types/service';

export const servicesApi = {
  /**
   * Get all services with optional filters
   */
  getAll: async (filters?: ServiceFilters): Promise<ApiResponse<Service[]>> => {
    const response = await apiClient.get<ApiResponse<Service[]>>('/services', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get paginated services
   */
  getPaginated: async (
    page: number = 1,
    perPage: number = 12,
    filters?: ServiceFilters
  ): Promise<PaginatedResponse<Service>> => {
    const response = await apiClient.get<PaginatedResponse<Service>>('/services', {
      params: {
        page,
        perPage,
        ...filters,
      },
    });
    return response.data;
  },

  /**
   * Get service by ID
   */
  getById: async (id: string): Promise<ApiResponse<Service>> => {
    const response = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data;
  },

  /**
   * Get featured/popular services
   */
  getFeatured: async (limit: number = 6): Promise<ApiResponse<Service[]>> => {
    const response = await apiClient.get<ApiResponse<Service[]>>('/services/featured', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Search services by keyword
   */
  search: async (query: string): Promise<ApiResponse<Service[]>> => {
    const response = await apiClient.get<ApiResponse<Service[]>>('/services/search', {
      params: { q: query },
    });
    return response.data;
  },
};

export const categoriesApi = {
  /**
   * Get all service categories
   */
  getAll: async (): Promise<ApiResponse<ServiceCategory[]>> => {
    const response = await apiClient.get<ApiResponse<ServiceCategory[]>>('/categories');
    return response.data;
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<ApiResponse<ServiceCategory>> => {
    const response = await apiClient.get<ApiResponse<ServiceCategory>>(`/categories/${id}`);
    return response.data;
  },

  /**
   * Get services by category
   */
  getServices: async (categoryId: string): Promise<ApiResponse<Service[]>> => {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      `/categories/${categoryId}/services`
    );
    return response.data;
  },
};
