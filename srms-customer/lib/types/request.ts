// Backend returns snake_case fields - aligned with Laravel API Resources

export type ServiceRequestStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ServiceRequestPriority = 'low' | 'medium' | 'high';

export interface ServiceRequest {
  id: string;
  request_number: string;
  title: string;
  description: string;
  status: ServiceRequestStatus;
  priority?: ServiceRequestPriority;
  service: {
    id: string;
    name: string;
  };
  created_by?: {
    id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
  };
  assigned_to?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
  due_date?: string;
  closed_at?: string;
  is_active: boolean;
  comments_count?: number;
  media_count?: number;
  created_at: string;
  updated_at: string;
  // Legacy compat fields (some pages use these)
  scheduledDate?: string;
  address?: string;
  totalAmount?: number;
}

export interface CreateServiceRequestDto {
  service_id: string;
  title: string;
  description: string;
}

export interface UpdateServiceRequestDto {
  title?: string;
  description?: string;
}

export interface CancelServiceRequestDto {
  reason?: string;
}

export interface Comment {
  id: string;
  body: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateCommentDto {
  body: string;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType?: string;
  size?: number;
  created_at: string;
}

export interface ServiceRequestFilters {
  status?: ServiceRequestStatus;
  service_id?: string;
  search?: string;
  sort_by?: 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}
