// Backend returns snake_case fields - aligned with Laravel API Resources

export type ServiceRequestStatus =
  | 'open'
  | 'in_progress'
  | 'closed'
  | 'cancelled';

export type ServiceRequestPriority = 'low' | 'medium' | 'high';

export interface Rating {
  id: string;
  rating: number;
  review: string | null;
  professionalism_rating: number | null;
  timeliness_rating: number | null;
  quality_rating: number | null;
  is_anonymous: boolean;
  created_at: string;
}

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
  schedules?: Array<{
    id: string;
    engineer: {
      id: string;
      first_name: string;
      last_name: string;
      email?: string;
    };
    scheduled_at: string;
    completed_at?: string | null;
    status: string;
    actual_price?: string | null;
    gst_rate?: string | null;
    gst_amount?: string | null;
    total_amount?: string | null;
    payment_status?: 'pending' | 'paid' | 'paid_verified' | null;
    payment_due_at?: string | null;
    payment_uploaded_at?: string | null;
    payment_verified_at?: string | null;
    invoice?: {
      invoice_number: string;
      sent_at?: string | null;
      has_pdf: boolean;
    } | null;
  }>;
  due_date?: string;
  closed_at?: string;
  is_active: boolean;
  comments_count?: number;
  media_count?: number;
  created_at: string;
  updated_at: string;
  rating?: Rating | null;
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
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: { name: string } | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  body: string;
}

export interface Media {
  id: string;
  name: string;
  url: string;
  created_at?: string;
}

export interface ServiceRequestFilters {
  status?: ServiceRequestStatus;
  service_id?: string;
  search?: string;
  sort_by?: 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}
