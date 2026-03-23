import api from './api'
import type { ServiceRequest, Service } from '../features/serviceRequests/types'

interface ServiceRequestFilters {
  page?: number
  per_page?: number
  status?: string
  priority?: string
  assigned_to?: string
  created_by?: string
  service_id?: string
  date_from?: string
  date_to?: string
  search?: string
}

interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

interface DashboardStats {
  total: number
  open: number
  in_progress: number
  closed: number
  high_priority: number
  overdue: number
  due_within_7_days: number
}

export const serviceRequestService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  getServiceRequests: async (
    filters?: ServiceRequestFilters
  ): Promise<PaginatedResponse<ServiceRequest>> => {
    const response = await api.get('/service-requests', { params: filters })
    return response.data
  },

  getServiceRequest: async (id: string): Promise<ServiceRequest> => {
    const response = await api.get(`/service-requests/${id}`)
    return response.data.data
  },

  createServiceRequest: async (data: {
    service_id: string
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    due_date?: string
  }): Promise<ServiceRequest> => {
    const response = await api.post('/service-requests', data)
    return response.data.data
  },

  updateServiceRequest: async (
    id: string,
    data: {
      title?: string
      description?: string
      priority?: 'low' | 'medium' | 'high'
      due_date?: string
    }
  ): Promise<ServiceRequest> => {
    const response = await api.put(`/service-requests/${id}`, data)
    return response.data.data
  },

  deleteServiceRequest: async (id: string): Promise<void> => {
    await api.delete(`/service-requests/${id}`)
  },

  assignServiceRequest: async (id: string, assignedTo: string): Promise<ServiceRequest> => {
    const response = await api.post(`/service-requests/${id}/assign`, { assigned_to: assignedTo })
    return response.data.data
  },

  updateStatus: async (id: string, status: string): Promise<ServiceRequest> => {
    const response = await api.patch(`/service-requests/${id}/status`, { status })
    return response.data.data
  },

  closeServiceRequest: async (id: string, notes?: string): Promise<ServiceRequest> => {
    const response = await api.post(`/service-requests/${id}/close`, { notes })
    return response.data.data
  },
}

export const serviceService = {
  getServices: async (): Promise<Service[]> => {
    const response = await api.get('/public/services')
    return response.data.data
  },
}
