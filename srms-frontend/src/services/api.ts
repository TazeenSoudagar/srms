import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import type { AxiosInstance } from 'axios'
import toast from 'react-hot-toast'
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants'

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor: Attach auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor: Handle errors and 401 redirects
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      toast.error('Session expired. Please login again.')
      window.location.href = '/login'
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (status === 404) {
      toast.error('The requested resource was not found.')
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

export default api
