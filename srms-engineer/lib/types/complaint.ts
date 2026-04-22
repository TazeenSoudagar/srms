export type ComplaintStatus = 'pending' | 'in_progress' | 'closed';

export interface ComplaintMedia {
  id: string;
  name: string;
  url: string;
}

export interface Complaint {
  id: string;
  complaint_number: string;
  status: ComplaintStatus;
  description: string;
  admin_note?: string | null;
  closed_at?: string | null;
  service_request?: {
    id: string;
    request_number: string;
    title: string;
    status: string;
  };
  created_by?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_engineer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  media?: ComplaintMedia[];
  created_at: string;
  updated_at: string;
}
