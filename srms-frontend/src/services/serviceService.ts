import api from './api'
import type { Service } from '../features/services/types'

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

export const serviceService = {
  getServices: async (params?: {
    page?: number
    per_page?: number
    search?: string
  }): Promise<PaginatedResponse<Service>> => {
    const response = await api.get('/services', { params })
    return response.data
  },

  getService: async (id: string): Promise<Service> => {
    const response = await api.get(`/services/${id}`)
    return response.data.data
  },

  createService: async (data: {
    name: string
    description: string
    is_active: boolean
  }): Promise<Service> => {
    const response = await api.post('/services', data)
    return response.data.data
  },

  updateService: async (
    id: string,
    data: {
      name?: string
      description?: string
      is_active?: boolean
    }
  ): Promise<Service> => {
    const response = await api.put(`/services/${id}`, data)
    return response.data.data
  },

  deleteService: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`)
  },
}
