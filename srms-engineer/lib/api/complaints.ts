import apiClient from './client';
import type { Complaint } from '@/lib/types/complaint';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const getComplaints = (params?: { status?: string; page?: number }) =>
  apiClient.get<PaginatedResponse<Complaint>>('/complaints', { params });

export const getComplaint = (id: string) =>
  apiClient.get<{ data: Complaint }>(`/complaints/${id}`);

export const requestResolution = (id: string) =>
  apiClient.post<{ message: string }>(`/complaints/${id}/request-resolution`);

export const verifyResolution = (id: string, otp: string) =>
  apiClient.post<{ message: string; data: Complaint }>(
    `/complaints/${id}/verify-resolution`,
    { otp }
  );
