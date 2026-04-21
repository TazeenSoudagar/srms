import apiClient from "./client";
import type { ServiceRequest, PaginatedResponse, Comment, Rating } from "@/lib/types";

export const getAssignedRequests = (params?: {
  status?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
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

export const verifyCompletion = (id: string, otp: string) =>
  apiClient.post<{ message: string }>(`/service-requests/${id}/verify-completion`, { otp });

export const getRating = (id: string) =>
  apiClient.get<{ data: Rating }>(`/service-requests/${id}/rating`);
