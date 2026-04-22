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

export interface Rating {
  id: string;
  rating: number;
  review?: string | null;
  professionalism_rating?: number | null;
  timeliness_rating?: number | null;
  quality_rating?: number | null;
  is_anonymous: boolean;
  created_at: string;
  reviewer: { name: string; initials: string };
}

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
  rating?: Rating | null;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
}

export interface ScheduleCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface ScheduleEngineer {
  id: string;
  name: string;
  email: string;
}

export interface Schedule {
  id: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  scheduled_at: string;
  estimated_duration_minutes: number;
  engineer?: ScheduleEngineer;
  customer?: ScheduleCustomer;
  service_request?: { id: string; title: string; service?: { id: string; name: string } };
  actual_price?: number;
  total_amount?: number;
  notes?: string;
  location?: string;
  estimated_end_time?: string;
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
    complaint_id?: string;
  };
  read_at: string | null;
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
