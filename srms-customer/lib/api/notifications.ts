import { apiClient, PaginatedResponse } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

interface UnreadCountResponse {
  count: number;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

export const notificationsApi = {
  /**
   * Fetch paginated notifications for the authenticated user.
   */
  getAll: async (page: number = 1): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      '/notifications',
      { params: { page } }
    );
    return response.data;
  },

  /**
   * Fetch the number of unread notifications.
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get<UnreadCountResponse>(
      '/notifications/unread-count'
    );
    return response.data;
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  /**
   * Delete all notifications.
   */
  clearAll: async (): Promise<void> => {
    await apiClient.delete('/notifications');
  },
};
