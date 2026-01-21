// Constants for the application

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://srms-backend.test/api'

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
} as const
