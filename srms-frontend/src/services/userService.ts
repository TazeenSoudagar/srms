import api from './api'
import type { User } from '../features/users/types'

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

export const userService = {
  getUsers: async (params?: {
    page?: number
    per_page?: number
    search?: string
    role_id?: string
  }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params })
    return response.data
  },

  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`)
    return response.data.data
  },

  createUser: async (data: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    role_id: string
    password: string
    is_active: boolean
  }): Promise<User> => {
    const response = await api.post('/users', data)
    return response.data.data
  },

  updateUser: async (
    id: string,
    data: {
      first_name?: string
      last_name?: string
      email?: string
      phone?: string
      role_id?: string
      password?: string
      is_active?: boolean
    }
  ): Promise<User> => {
    const response = await api.put(`/users/${id}`, data)
    return response.data.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
