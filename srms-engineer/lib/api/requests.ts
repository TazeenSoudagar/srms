import apiClient from "./client";
import type { ServiceRequest, PaginatedResponse, Comment } from "@/lib/types";

export const getAssignedRequests = (params?: {
  status?: string;
  page?: number;
  per_page?: number;
}) =>
  apiClient.get<PaginatedResponse<ServiceRequest>>("/service-requests", {
    params,
  });

export const getRequest = (id: string) =>
  apiClient.get<{ data: ServiceRequest }>(`/service-requests/${id}`);

export const updateStatus = (id: string, status: string) =>
  apiClient.patch<{ data: ServiceRequest }>(`/service-requests/${id}/status`, { status });

export const requestCompletion = (id: string) =>
  apiClient.post<{ message: string }>(`/service-requests/${id}/request-completion`);

export const getComments = (id: string) =>
  apiClient.get<{ data: Comment[] }>(`/service-requests/${id}/comments`);

export const addComment = (id: string, body: string) =>
  apiClient.post<{ data: Comment }>(`/service-requests/${id}/comments`, { body });
