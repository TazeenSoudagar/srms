import api from './api'
import type { AuthResponse } from '../features/auth/types'

export const authService = {
  sendOtp: async (email: string, type: string = 'login'): Promise<{ message: string }> => {
    const response = await api.post('/auth/send-otp', { email, type })
    return response.data
  },

  verifyOtp: async (email: string, otp: string, type: string = 'login'): Promise<AuthResponse> => {
    const response = await api.post('/auth/verify-otp', { email, otp, type })
    return response.data
  },

  loginPassword: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login-password', { email, password })
    return response.data
  },
}
