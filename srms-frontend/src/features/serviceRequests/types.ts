export interface Service {
  id: string
  name: string
  description: string
  is_active: boolean
}

export interface ServiceRequest {
  id: string
  request_number: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  service: Service
  created_by: {
    id: string
    first_name: string
    last_name: string
  }
  assigned_to: {
    id: string
    first_name: string
    last_name: string
  } | null
  due_date: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}
