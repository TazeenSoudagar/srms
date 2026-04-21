import { apiClient, ApiResponse, PaginatedResponse } from './client';
import { Complaint, ComplaintFilters } from '../types/complaint';

export const complaintsApi = {
  getAll: async (filters?: ComplaintFilters): Promise<PaginatedResponse<Complaint>> => {
    const response = await apiClient.get<PaginatedResponse<Complaint>>('/complaints', {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Complaint>> => {
    const response = await apiClient.get<ApiResponse<Complaint>>(`/complaints/${id}`);
    return response.data;
  },

  create: async (data: {
    service_request_id: string;
    description: string;
    images: File[];
  }): Promise<ApiResponse<Complaint>> => {
    const formData = new FormData();
    formData.append('service_request_id', data.service_request_id);
    formData.append('description', data.description);
    data.images.forEach((image) => formData.append('images[]', image));
    const response = await apiClient.post<ApiResponse<Complaint>>('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
