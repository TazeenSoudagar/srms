import { apiClient, ApiResponse, PaginatedResponse } from './client';
import {
  ServiceRequest,
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
  CancelServiceRequestDto,
  Comment,
  CreateCommentDto,
  Media,
  ServiceRequestFilters,
} from '../types/request';

export const serviceRequestsApi = {
  /**
   * Get all service requests for current user
   */
  getAll: async (filters?: ServiceRequestFilters): Promise<ApiResponse<ServiceRequest[]>> => {
    const response = await apiClient.get<ApiResponse<ServiceRequest[]>>('/service-requests', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get paginated service requests
   */
  getPaginated: async (
    page: number = 1,
    perPage: number = 10,
    filters?: ServiceRequestFilters
  ): Promise<PaginatedResponse<ServiceRequest>> => {
    const response = await apiClient.get<PaginatedResponse<ServiceRequest>>(
      '/service-requests',
      {
        params: {
          page,
          perPage,
          ...filters,
        },
      }
    );
    return response.data;
  },

  /**
   * Get service request by ID
   */
  getById: async (id: string): Promise<ApiResponse<ServiceRequest>> => {
    const response = await apiClient.get<ApiResponse<ServiceRequest>>(
      `/service-requests/${id}`
    );
    return response.data;
  },

  /**
   * Create new service request
   */
  create: async (data: CreateServiceRequestDto): Promise<ApiResponse<ServiceRequest>> => {
    const response = await apiClient.post<ApiResponse<ServiceRequest>>(
      '/service-requests',
      data
    );
    return response.data;
  },

  /**
   * Update service request
   */
  update: async (
    id: string,
    data: UpdateServiceRequestDto
  ): Promise<ApiResponse<ServiceRequest>> => {
    const response = await apiClient.put<ApiResponse<ServiceRequest>>(
      `/service-requests/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Cancel service request
   */
  cancel: async (
    id: string,
    data: CancelServiceRequestDto
  ): Promise<ApiResponse<ServiceRequest>> => {
    const response = await apiClient.post<ApiResponse<ServiceRequest>>(
      `/service-requests/${id}/close`,
      data
    );
    return response.data;
  },

  /**
   * Delete service request
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/service-requests/${id}`);
  },
};

export const commentsApi = {
  /**
   * Get all comments for a service request
   */
  getAll: async (requestId: string): Promise<ApiResponse<Comment[]>> => {
    const response = await apiClient.get<ApiResponse<Comment[]>>(
      `/service-requests/${requestId}/comments`
    );
    return response.data;
  },

  /**
   * Add comment to service request
   */
  create: async (
    requestId: string,
    data: CreateCommentDto
  ): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.post<ApiResponse<Comment>>(
      `/service-requests/${requestId}/comments`,
      data
    );
    return response.data;
  },

  /**
   * Update comment
   */
  update: async (
    requestId: string,
    commentId: string,
    data: CreateCommentDto
  ): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.put<ApiResponse<Comment>>(
      `/service-requests/${requestId}/comments/${commentId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete comment
   */
  delete: async (requestId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/service-requests/${requestId}/comments/${commentId}`);
  },
};

export const mediaApi = {
  /**
   * Get all media attachments for a service request
   */
  getAll: async (requestId: string): Promise<ApiResponse<Media[]>> => {
    const response = await apiClient.get<ApiResponse<Media[]>>(
      `/service-requests/${requestId}/media`
    );
    return response.data;
  },

  /**
   * Upload media attachment
   */
  upload: async (requestId: string, file: File): Promise<ApiResponse<Media>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<Media>>(
      `/service-requests/${requestId}/media`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete media attachment
   */
  delete: async (requestId: string, mediaId: string): Promise<void> => {
    await apiClient.delete(`/service-requests/${requestId}/media/${mediaId}`);
  },
};
