import api from '../../../services/api';
import type { ActivityLogResponse, ActivityLogFilters, ActivityLog } from '../types';

/**
 * Fetch activity logs with filters
 */
export const getActivityLogs = async (
  filters: ActivityLogFilters = {}
): Promise<ActivityLogResponse> => {
  const params = new URLSearchParams();

  if (filters.date_filter) params.append('date_filter', filters.date_filter);
  if (filters.loggable_type) params.append('loggable_type', filters.loggable_type);
  if (filters.role_id) params.append('role_id', filters.role_id);
  if (filters.action) params.append('action', filters.action);
  if (filters.search) params.append('search', filters.search);
  if (filters.per_page) params.append('per_page', filters.per_page.toString());

  const response = await api.get<ActivityLogResponse>(`/activity-logs?${params.toString()}`);
  return response.data;
};

/**
 * Fetch a single activity log by ID
 */
export const getActivityLogById = async (id: string): Promise<ActivityLog> => {
  const response = await api.get<{ data: ActivityLog }>(`/activity-logs/${id}`);
  return response.data.data;
};
