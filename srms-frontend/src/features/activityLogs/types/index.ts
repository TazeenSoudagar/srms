export interface ActivityLog {
  id: string;
  action: string;
  loggable_type: string;
  loggable_id: string;
  details: Record<string, unknown> | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  };
  created_at: string;
}

export interface ActivityLogFilters {
  date_filter?: 'today' | 'week' | 'month' | 'year' | 'all';
  loggable_type?: 'ServiceRequest' | 'User' | 'Comment' | 'Service' | '';
  role_id?: string;
  action?: string;
  search?: string;
  per_page?: number;
}

export interface ActivityLogResponse {
  data: ActivityLog[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
