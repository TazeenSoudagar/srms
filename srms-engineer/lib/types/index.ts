export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: Role;
  is_active: boolean;
  avatar?: { url: string } | null;
  bio?: string;
  hourly_rate?: number;
  years_of_experience?: number;
  specializations?: string[];
  availability_status?: "available" | "busy" | "offline";
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export type ServiceRequestStatus = "open" | "in_progress" | "closed" | "cancelled";
export type ServiceRequestPriority = "low" | "medium" | "high";

export interface ServiceRequest {
  id: string;
  request_number: string;
  title: string;
  description: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  created_by: string;
  created_by_user?: User;
  service?: { id: string; name: string };
  schedules?: Schedule[];
  comments?: Comment[];
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
}

export interface Schedule {
  id: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  scheduled_at: string;
  estimated_duration_minutes: number;
  engineer?: User;
  customer?: User;
  actual_price?: number;
  total_amount?: number;
}

export interface Comment {
  id: string;
  body: string;
  user: User;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: string;
  data: {
    title: string;
    body: string;
    icon?: string;
    color?: string;
    service_request_id?: string;
    request_number?: string;
  };
  read_at: string | null;
  created_at: string;
}

export interface Rating {
  id: string;
  rating: number;
  review?: string;
  service_request_id: string;
  service_request?: ServiceRequest;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
