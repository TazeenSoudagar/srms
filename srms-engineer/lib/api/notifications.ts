import apiClient from "./client";
import type { Notification, PaginatedResponse } from "@/lib/types";

export const getNotifications = (page = 1) =>
  apiClient.get<PaginatedResponse<Notification>>("/notifications", { params: { page } });

export const getUnreadCount = () =>
  apiClient.get<{ count: number }>("/notifications/unread-count");

export const markAsRead = (id: string) =>
  apiClient.post(`/notifications/${id}/read`);

export const markAllAsRead = () =>
  apiClient.post("/notifications/read-all");
